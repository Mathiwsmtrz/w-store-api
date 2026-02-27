import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './application/customers/services/customers.service';
import { ProductsService } from './application/products/services/products.service';
import { OrdersService } from './application/orders/services/orders.service';
import { CatalogController } from './presentation/products/controllers/catalog.controller';
import { OrdersController } from './presentation/orders/controllers/orders.controller';
import { CustomerEntity } from './infrastructure/customers/typeorm/entities/customer.entity';
import { CustomerAddressEntity } from './infrastructure/customers/typeorm/entities/customer-address.entity';
import { ProductCategoryEntity } from './infrastructure/products/typeorm/entities/product-category.entity';
import { ProductEntity } from './infrastructure/products/typeorm/entities/product.entity';
import { OrderEntity } from './infrastructure/orders/typeorm/entities/order.entity';
import { OrderDetailEntity } from './infrastructure/orders/typeorm/entities/order-detail.entity';
import { PaymentEntity } from './infrastructure/payments/typeorm/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerEntity,
      CustomerAddressEntity,
      ProductCategoryEntity,
      ProductEntity,
      OrderEntity,
      OrderDetailEntity,
      PaymentEntity,
    ]),
  ],
  controllers: [CatalogController, OrdersController],
  providers: [CustomersService, ProductsService, OrdersService],
  exports: [CustomersService, ProductsService, OrdersService],
})
export class CommerceModule {}
