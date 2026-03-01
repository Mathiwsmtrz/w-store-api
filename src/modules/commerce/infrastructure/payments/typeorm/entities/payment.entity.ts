import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderEntity } from '../../../orders/typeorm/entities/order.entity';
import { PaymentStatus } from '../../../../domain/payments/enums/payment-status.enum';

@Entity({ name: 'payments' })
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderEntity, (order) => order.payments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ name: 'payment_ref_code', type: 'varchar', length: 100 })
  paymentRefCode: string;

  @Column({ type: 'varchar', length: 20, default: 'WOMPI' })
  provider: string;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  transactionId: string | null;

  @Column({ name: 'currency', type: 'varchar', length: 10, nullable: true })
  currency: string | null;

  @Column({
    name: 'amount_in_cents',
    type: 'int',
    nullable: true,
  })
  amountInCents: number | null;

  @Column({
    name: 'status_reason',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  statusReason: string | null;

  @Column({
    name: 'raw_event_id',
    type: 'varchar',
    length: 120,
    nullable: true,
    unique: true,
  })
  rawEventId: string | null;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
