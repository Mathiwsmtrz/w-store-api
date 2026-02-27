import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerAddressEntity } from './customer-address.entity';
import { OrderEntity } from '../../../orders/typeorm/entities/order.entity';

@Entity({ name: 'customers' })
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 140 })
  fullname: string;

  @Column({ unique: true, length: 160 })
  email: string;

  @OneToMany(() => CustomerAddressEntity, (address) => address.customer)
  addresses: CustomerAddressEntity[];

  @OneToMany(() => OrderEntity, (order) => order.customer)
  orders: OrderEntity[];
}
