import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerEntity } from '../../../customers/typeorm/entities/customer.entity';
import { OrderDetailEntity } from './order-detail.entity';
import { PaymentEntity } from '../../../payments/typeorm/entities/payment.entity';
import { OrderMethod } from '../../../../domain/orders/enums/order-method.enum';
import { OrderStatus } from '../../../../domain/orders/enums/order-status.enum';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CustomerEntity, (customer) => customer.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({
    name: 'date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  net: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fees: string;

  @Column({
    name: 'delivery_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  deliveryCost: string;

  @Column({ type: 'enum', enum: OrderMethod })
  method: OrderMethod;

  @Column({ unique: true, length: 20 })
  code: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAID,
  })
  status: OrderStatus;

  @OneToMany(() => OrderDetailEntity, (detail) => detail.order, {
    cascade: true,
    eager: true,
  })
  details: OrderDetailEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.order, { eager: true })
  payments: PaymentEntity[];
}
