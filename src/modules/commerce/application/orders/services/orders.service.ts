import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../../../infrastructure/orders/typeorm/entities/order.entity';
import { OrderDetailEntity } from '../../../infrastructure/orders/typeorm/entities/order-detail.entity';
import { PaymentEntity } from '../../../infrastructure/payments/typeorm/entities/payment.entity';
import { OrderStatus } from '../../../domain/orders/enums/order-status.enum';
import { PaymentStatus } from '../../../domain/payments/enums/payment-status.enum';
import { CustomersService } from '../../customers/services/customers.service';
import { ProductsService } from '../../products/services/products.service';

type OrderCustomerRef = {
  id: number;
};

type OrderProductRef = {
  id: number;
  price: string;
  productFee: string;
  deliveryFee: string;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async createNewOrder(dto: CreateOrderDto) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const getOrCreateCustomer =
        this.customersService.getOrCreateByEmailWithAddress.bind(
          this.customersService,
        ) as (
          input: CreateOrderDto['customer'],
          manager: typeof runner.manager,
        ) => Promise<OrderCustomerRef>;
      const customer = await getOrCreateCustomer(dto.customer, runner.manager);

      const productIds = dto.items.map((item) => item.productId);
      const products: OrderProductRef[] =
        (await this.productsService.findProductsByIdsOrFail(
          productIds,
          runner.manager,
        )) as OrderProductRef[];

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );
      let net = 0;
      let fees = 0;
      let deliveryCost = 0;

      const details = dto.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        const quantity = item.quantity ?? 1;
        const price = Number(product.price) * quantity;
        const fee = Number(product.productFee) * quantity;
        const deliveryFee = Number(product.deliveryFee) * quantity;
        net += price;
        fees += fee;
        deliveryCost += deliveryFee;

        return runner.manager.create(OrderDetailEntity, {
          product,
          price: String(price.toFixed(2)),
          fee: String(fee.toFixed(2)),
          deliveryFee: String(deliveryFee.toFixed(2)),
        });
      });

      const code = await this.generateOrderCode(
        runner.manager.getRepository(OrderEntity),
      );
      const total = net + fees + deliveryCost;

      const order = runner.manager.create(OrderEntity, {
        customer,
        method: dto.method,
        code,
        status: OrderStatus.PENDING_PAID,
        net: String(net.toFixed(2)),
        fees: String(fees.toFixed(2)),
        deliveryCost: String(deliveryCost.toFixed(2)),
        total: String(total.toFixed(2)),
      });

      const savedOrder = await runner.manager.save(order);

      for (const detail of details) {
        detail.order = savedOrder;
      }
      await runner.manager.save(details);

      if (dto.paymentRefCode) {
        const payment = runner.manager.create(PaymentEntity, {
          order: savedOrder,
          paymentRefCode: dto.paymentRefCode,
          status: PaymentStatus.PENDING,
        });
        await runner.manager.save(payment);
      }

      await runner.commitTransaction();

      return this.searchOrderByCode(savedOrder.code);
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  searchOrderByCode(code: string) {
    return this.orderRepo.findOne({
      where: { code },
      relations: {
        customer: { addresses: true },
        details: { product: { category: true } },
        payments: true,
      },
    });
  }

  private async generateOrderCode(orderRepository: Repository<OrderEntity>) {
    const min = 100000;
    const max = 999999;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = String(Math.floor(Math.random() * (max - min + 1)) + min);
      const exists = await orderRepository.exists({ where: { code } });
      if (!exists) {
        return code;
      }
    }

    return String(Date.now()).slice(-8);
  }
}
