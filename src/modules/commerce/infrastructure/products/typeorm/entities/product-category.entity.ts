import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity({ name: 'products_category' })
export class ProductCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ unique: true, length: 140 })
  slug: string;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];
}
