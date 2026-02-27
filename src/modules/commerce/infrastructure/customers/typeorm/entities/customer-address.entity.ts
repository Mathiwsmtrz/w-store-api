import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';

@Entity({ name: 'customers_address' })
export class CustomerAddressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  address: string;

  @Column({ nullable: true, length: 120 })
  city?: string;

  @Column({ nullable: true, length: 120 })
  state?: string;

  @Column({ nullable: true, length: 120 })
  country?: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.addresses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  customer: CustomerEntity;
}
