import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { OrderMethod } from '../../../domain/orders/enums/order-method.enum';
import { OrderStatus } from '../../../domain/orders/enums/order-status.enum';
import { PaymentStatus } from '../../../domain/payments/enums/payment-status.enum';
import { WompiPaymentsService } from './wompi-payments.service';

describe('WompiPaymentsService', () => {
  const configService = { get: jest.fn() };
  const dataSource = { transaction: jest.fn() };
  const orderRepository = { findOne: jest.fn() };
  const paymentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  let service: WompiPaymentsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new WompiPaymentsService(
      configService as never,
      dataSource as never,
      orderRepository as never,
      paymentRepository as never,
    );
  });

  it('throws when order does not exist in createTransaction', async () => {
    orderRepository.findOne.mockResolvedValue(null);

    await expect(service.createTransaction('NOPE')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when order is not WOMPI', async () => {
    orderRepository.findOne.mockResolvedValue({
      method: OrderMethod.COD,
      code: '123',
      payments: [],
    });

    await expect(service.createTransaction('123')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when WOMPI public key is missing', async () => {
    orderRepository.findOne.mockResolvedValue({
      method: OrderMethod.WOMPI,
      code: '123',
      total: '10.00',
      payments: [],
      customer: { email: 'x@example.com' },
    });
    configService.get.mockImplementation((key: string, fallback?: string) => {
      if (key === 'WOMPI_PUBLIC_KEY') {
        return undefined;
      }
      return fallback;
    });

    await expect(service.createTransaction('123')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('creates transaction and updates existing pending payment', async () => {
    const existingPayment = {
      provider: 'WOMPI',
      status: PaymentStatus.PENDING,
      paymentRefCode: 'old',
      amountInCents: 0,
      currency: 'COP',
      statusReason: 'x',
      rawEventId: 'y',
    };
    orderRepository.findOne.mockResolvedValue({
      method: OrderMethod.WOMPI,
      code: '123456',
      total: '12.34',
      payments: [existingPayment],
      customer: { email: 'john@example.com' },
    });
    configService.get.mockImplementation((key: string, fallback?: string) => {
      if (key === 'WOMPI_PUBLIC_KEY') {
        return 'pub_test';
      }
      if (key === 'WOMPI_CURRENCY') {
        return 'COP';
      }
      if (key === 'WOMPI_INTEGRITY_SECRET') {
        return 'integrity_secret';
      }
      if (key === 'WOMPI_ENV') {
        return 'sandbox';
      }
      return fallback;
    });
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            presigned_acceptance: {
              acceptance_token: 'acc_token_1',
            },
          },
        }),
    } as Response);
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const result = await service.createTransaction('123456');

    expect(result).toEqual(
      expect.objectContaining({
        orderCode: '123456',
        amountInCents: 1234,
        publicKey: 'pub_test',
        acceptanceToken: 'acc_token_1',
        customerEmail: 'john@example.com',
      }),
    );
    expect(result.integritySignature).toBe(
      createHash('sha256')
        .update(`${result.reference}1234COPintegrity_secret`)
        .digest('hex'),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox.wompi.co/v1/merchants/pub_test',
    );
    expect(paymentRepository.save).toHaveBeenCalledWith(existingPayment);

    fetchMock.mockRestore();
    (Date.now as jest.Mock).mockRestore();
  });

  it('creates a new pending payment when none exists', async () => {
    orderRepository.findOne.mockResolvedValue({
      method: OrderMethod.WOMPI,
      code: 'ABC',
      total: '10.00',
      payments: [],
      customer: { email: 'new@example.com' },
    });
    configService.get.mockImplementation((key: string, fallback?: string) => {
      if (key === 'WOMPI_PUBLIC_KEY') {
        return 'pub_new';
      }
      if (key === 'WOMPI_CURRENCY') {
        return 'COP';
      }
      if (key === 'WOMPI_API_BASE_URL') {
        return 'https://custom.wompi.co/v1/';
      }
      return fallback;
    });
    paymentRepository.create.mockImplementation((payload) => payload);
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response);
    jest.spyOn(Date, 'now').mockReturnValue(1000);

    const result = await service.createTransaction('ABC');

    expect(result.reference).toBe('ABC-1000');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://custom.wompi.co/v1/merchants/pub_new',
    );
    expect(paymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'WOMPI',
        status: PaymentStatus.PENDING,
      }),
    );

    fetchMock.mockRestore();
    (Date.now as jest.Mock).mockRestore();
  });

  it('throws when merchant endpoint returns non-ok response', async () => {
    orderRepository.findOne.mockResolvedValue({
      method: OrderMethod.WOMPI,
      code: 'BAD',
      total: '10.00',
      payments: [],
      customer: { email: 'bad@example.com' },
    });
    configService.get.mockImplementation((key: string, fallback?: string) => {
      if (key === 'WOMPI_PUBLIC_KEY') {
        return 'pub_bad';
      }
      if (key === 'WOMPI_CURRENCY') {
        return 'COP';
      }
      return fallback;
    });
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve('upstream failure'),
    } as Response);

    await expect(service.createTransaction('BAD')).rejects.toThrow(
      BadRequestException,
    );

    fetchMock.mockRestore();
  });

  it('rejects webhook payload with missing transaction information', async () => {
    await expect(service.processWebhook({} as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects webhook payload with invalid signature', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'WOMPI_EVENTS_SECRET') {
        return 'events_secret';
      }
      return undefined;
    });

    await expect(
      service.processWebhook({
        timestamp: 100,
        signature: {
          properties: ['transaction.reference'],
          checksum: 'invalid',
        },
        data: {
          transaction: {
            id: 'tx_1',
            status: 'APPROVED',
            reference: 'REF-1',
          },
        },
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('returns duplicate when raw event id already exists', async () => {
    configService.get.mockReturnValue(undefined);
    paymentRepository.findOne
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null);

    const result = await service.processWebhook({
      timestamp: 100,
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'tx_2',
          status: 'PENDING',
          reference: 'REF-2',
        },
      },
    });

    expect(result).toEqual({ ok: true, duplicate: true });
  });

  it('throws when payment reference does not exist', async () => {
    configService.get.mockReturnValue(undefined);
    paymentRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(
      service.processWebhook({
        timestamp: 100,
        data: {
          transaction: {
            id: 'tx_3',
            status: 'PENDING',
            reference: 'REF-3',
          },
        },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('marks order as PAID when transaction is APPROVED', async () => {
    configService.get.mockReturnValue(undefined);
    const payment = {
      status: PaymentStatus.PENDING,
      order: { status: OrderStatus.PENDING_PAID },
      transactionId: null,
      currency: null,
      amountInCents: null,
      statusReason: null,
      rawEventId: null,
    };
    paymentRepository.findOne.mockImplementation((input: unknown) => {
      const query = input as {
        where?: { rawEventId?: string; paymentRefCode?: string };
      };
      if (query.where?.rawEventId) {
        return Promise.resolve(null);
      }
      if (query.where?.paymentRefCode === 'REF-4') {
        return Promise.resolve(payment);
      }
      return Promise.resolve(null);
    });
    const manager = { save: jest.fn().mockResolvedValue(undefined) };
    dataSource.transaction.mockImplementation(
      (cb: (m: typeof manager) => Promise<void>) => cb(manager),
    );

    const result = await service.processWebhook({
      timestamp: 123,
      data: {
        transaction: {
          id: 'tx_4',
          status: 'APPROVED',
          status_message: 'ok',
          reference: 'REF-4',
          amount_in_cents: 3000,
          currency: 'COP',
        },
      },
    });

    expect(result).toEqual({ ok: true, duplicate: false });
    expect(payment.status).toBe(PaymentStatus.COMPLETED);
    expect(payment.order.status).toBe(OrderStatus.PAID);
    expect(manager.save).toHaveBeenCalledTimes(2);
  });

  it('marks order as CANCEL when status is not APPROVED or PENDING', async () => {
    configService.get.mockReturnValue(undefined);
    const payment = {
      status: PaymentStatus.PENDING,
      order: { status: OrderStatus.PENDING_PAID },
      transactionId: null,
      currency: null,
      amountInCents: null,
      statusReason: null,
      rawEventId: null,
    };
    paymentRepository.findOne.mockImplementation((input: unknown) => {
      const query = input as {
        where?: { rawEventId?: string; paymentRefCode?: string };
      };
      if (query.where?.rawEventId) {
        return Promise.resolve(null);
      }
      if (query.where?.paymentRefCode === 'REF-5') {
        return Promise.resolve(payment);
      }
      return Promise.resolve(null);
    });
    const manager = { save: jest.fn().mockResolvedValue(undefined) };
    dataSource.transaction.mockImplementation(
      (cb: (m: typeof manager) => Promise<void>) => cb(manager),
    );

    await service.processWebhook({
      timestamp: 123,
      data: {
        transaction: {
          id: 'tx_5',
          status: 'DECLINED',
          reference: 'REF-5',
        },
      },
    });

    expect(payment.status).toBe(PaymentStatus.CANCEL);
    expect(payment.order.status).toBe(OrderStatus.CANCEL);
  });
});
