import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductCategoryEntity } from './product-category.entity';
import { OrderDetailEntity } from '../../../orders/typeorm/entities/order-detail.entity';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductCategoryEntity, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: true,
  })
  category: ProductCategoryEntity;

  @Column({ length: 160 })
  name: string;

  @Column({ unique: true, length: 180 })
  slug: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Column({ length: 500, nullable: true })
  image?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'product_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  productFee: string;

  @Column({
    name: 'delivery_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  deliveryFee: string;

  @OneToMany(() => OrderDetailEntity, (detail) => detail.product)
  details: OrderDetailEntity[];
}
