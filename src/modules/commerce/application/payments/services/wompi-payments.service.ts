import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { OrderMethod } from '../../../domain/orders/enums/order-method.enum';
import { OrderStatus } from '../../../domain/orders/enums/order-status.enum';
import { PaymentStatus } from '../../../domain/payments/enums/payment-status.enum';
import { OrderEntity } from '../../../infrastructure/orders/typeorm/entities/order.entity';
import { PaymentEntity } from '../../../infrastructure/payments/typeorm/entities/payment.entity';
import { WompiWebhookPayload } from '../dto/wompi-webhook.dto';

@Injectable()
export class WompiPaymentsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  async createTransaction(orderCode: string) {
    const order = await this.orderRepository.findOne({
      where: { code: orderCode },
      relations: { customer: true, payments: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with code ${orderCode} not found`);
    }
    if (order.method !== OrderMethod.WOMPI) {
      throw new BadRequestException(
        'Wompi transaction is only available for WOMPI orders',
      );
    }

    const publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY');
    if (!publicKey) {
      throw new InternalServerErrorException(
        'Missing WOMPI_PUBLIC_KEY in environment',
      );
    }

    const currency = this.configService.get<string>('WOMPI_CURRENCY', 'COP');
    const amountInCents = Math.round(Number(order.total) * 100);
    const reference = `${order.code}-${Date.now()}`;
    const integritySignature = this.buildIntegritySignature(
      reference,
      amountInCents,
      currency,
    );

    const merchantInfo = await this.fetchMerchantInfo(publicKey);
    console.log('merchantInfo', merchantInfo);
    const acceptanceToken = this.readAcceptanceToken(merchantInfo);

    await this.ensurePendingPayment(order, {
      reference,
      amountInCents,
      currency,
    });

    return {
      orderCode: order.code,
      reference,
      amountInCents,
      currency,
      publicKey,
      acceptanceToken,
      integritySignature,
      customerEmail: order.customer.email,
    };
  }

  async processWebhook(payload: WompiWebhookPayload) {
    const transaction = payload.data?.transaction;
    if (!transaction?.reference || !transaction.status) {
      throw new BadRequestException(
        'Invalid webhook payload: missing transaction details',
      );
    }

    if (!this.validateWebhookSignature(payload)) {
      throw new UnauthorizedException('Invalid Wompi webhook signature');
    }

    const rawEventId = this.buildRawEventId(payload, transaction.id);
    const duplicate = await this.paymentRepository.findOne({
      where: { rawEventId },
      select: { id: true },
    });
    if (duplicate) {
      return { ok: true, duplicate: true };
    }

    const payment = await this.paymentRepository.findOne({
      where: { paymentRefCode: transaction.reference },
      relations: { order: true },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment with reference ${transaction.reference} not found`,
      );
    }

    const normalizedStatus = this.normalizeStatus(transaction.status);

    await this.dataSource.transaction(async (manager) => {
      payment.transactionId = transaction.id ?? payment.transactionId;
      payment.currency = transaction.currency ?? payment.currency;
      payment.amountInCents =
        transaction.amount_in_cents ?? payment.amountInCents;
      payment.statusReason = transaction.status_message ?? null;
      payment.rawEventId = rawEventId;
      payment.status = normalizedStatus;
      await manager.save(payment);

      if (normalizedStatus === PaymentStatus.COMPLETED) {
        payment.order.status = OrderStatus.PAID;
      } else if (normalizedStatus === PaymentStatus.CANCEL) {
        payment.order.status = OrderStatus.CANCEL;
      }
      await manager.save(payment.order);
    });

    return { ok: true, duplicate: false };
  }

  private async ensurePendingPayment(
    order: OrderEntity,
    input: { reference: string; amountInCents: number; currency: string },
  ) {
    const existing = order.payments.find(
      (payment) =>
        payment.provider === 'WOMPI' &&
        payment.status === PaymentStatus.PENDING,
    );

    if (existing) {
      existing.paymentRefCode = input.reference;
      existing.amountInCents = input.amountInCents;
      existing.currency = input.currency;
      existing.statusReason = null;
      existing.rawEventId = null;
      await this.paymentRepository.save(existing);
      return;
    }

    const payment = this.paymentRepository.create({
      order,
      paymentRefCode: input.reference,
      provider: 'WOMPI',
      status: PaymentStatus.PENDING,
      amountInCents: input.amountInCents,
      currency: input.currency,
    });
    await this.paymentRepository.save(payment);
  }

  private buildIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ) {
    const integritySecret =
      this.configService.get<string>('WOMPI_INTEGRITY_SECRET') ?? '';
    if (!integritySecret) {
      return null;
    }
    return createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${integritySecret}`)
      .digest('hex');
  }

  private buildRawEventId(
    payload: WompiWebhookPayload,
    transactionId?: string,
  ) {
    const timestamp = payload.timestamp ?? payload.sent_at ?? Date.now();
    return `${payload.event ?? 'transaction.updated'}:${transactionId ?? 'unknown'}:${timestamp}`;
  }

  private normalizeStatus(status: string): PaymentStatus {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'APPROVED') {
      return PaymentStatus.COMPLETED;
    }
    if (upperStatus === 'PENDING') {
      return PaymentStatus.PENDING;
    }
    return PaymentStatus.CANCEL;
  }

  private validateWebhookSignature(payload: WompiWebhookPayload): boolean {
    const eventsSecret = this.configService.get<string>('WOMPI_EVENTS_SECRET');
    if (!eventsSecret) {
      return true;
    }

    const signature = payload.signature;
    if (!signature?.checksum || !signature.properties?.length) {
      return false;
    }

    const values = signature.properties.map((propertyName) => {
      const value = this.resolvePropertyValue(payload, propertyName);
      return value ?? '';
    });
    const timestamp = payload.timestamp ? String(payload.timestamp) : '';
    const expectedChecksum = createHash('sha256')
      .update(`${values.join('')}${timestamp}${eventsSecret}`)
      .digest('hex');

    return expectedChecksum.toLowerCase() === signature.checksum.toLowerCase();
  }

  private resolvePropertyValue(
    payload: WompiWebhookPayload,
    propertyName: string,
  ): string | number | undefined {
    const normalizedPath = propertyName.replace(/^data\./, '');
    const segments = normalizedPath.split('.');

    let current: unknown = payload.data;
    for (const segment of segments) {
      if (typeof current !== 'object' || current === null) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[segment];
    }

    return typeof current === 'string' || typeof current === 'number'
      ? current
      : undefined;
  }

  private getWompiBaseUrl(): string {
    const configured = this.configService.get<string>('WOMPI_API_BASE_URL');
    if (configured) {
      const clean = configured.trim().replace(/\/+$/, '');
      return clean.endsWith('/v1') ? clean.slice(0, -3) : clean;
    }

    const env = this.configService.get<string>('WOMPI_ENV', 'sandbox');
    return env === 'prod'
      ? 'https://production.wompi.co'
      : 'https://sandbox.wompi.co';
  }

  private async fetchMerchantInfo(publicKey: string): Promise<unknown> {
    const endpoint = `${this.getWompiBaseUrl()}/v1/merchants/${publicKey}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new BadRequestException(
        `Could not fetch Wompi merchant information. status=${response.status} endpoint=${endpoint} body=${body.slice(
          0,
          180,
        )}`,
      );
    }

    return response.json() as Promise<unknown>;
  }

  private readAcceptanceToken(merchantInfo: unknown): string | null {
    if (typeof merchantInfo !== 'object' || merchantInfo === null) {
      return null;
    }
    const data = (merchantInfo as Record<string, unknown>).data;
    if (typeof data !== 'object' || data === null) {
      return null;
    }
    const acceptance = (data as Record<string, unknown>).presigned_acceptance;
    if (typeof acceptance !== 'object' || acceptance === null) {
      return null;
    }
    const token = (acceptance as Record<string, unknown>).acceptance_token;
    return typeof token === 'string' ? token : null;
  }
}
