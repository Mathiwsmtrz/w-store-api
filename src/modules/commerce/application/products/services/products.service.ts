import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ProductCategoryEntity } from '../../../infrastructure/products/typeorm/entities/product-category.entity';
import { ProductEntity } from '../../../infrastructure/products/typeorm/entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly productCategoryRepo: Repository<ProductCategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async listCategories() {
    return this.productCategoryRepo.find({ order: { name: 'ASC' } });
  }

  async listProducts(category?: string) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.id', 'DESC');

    if (category) {
      if (/^\d+$/.test(category)) {
        qb.andWhere('category.id = :categoryId', {
          categoryId: Number(category),
        });
      } else {
        qb.andWhere('category.slug = :categorySlug', {
          categorySlug: category,
        });
      }
    }

    return qb.getMany();
  }

  async getProductBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found`);
    }

    return product;
  }

  async findProductsByIdsOrFail(
    productIds: number[],
    manager?: EntityManager,
  ): Promise<ProductEntity[]> {
    const uniqueProductIds = [...new Set(productIds)];
    const productRepo = manager
      ? manager.getRepository(ProductEntity)
      : this.productRepo;
    const products = await productRepo.findBy({
      id: In(uniqueProductIds),
    });

    if (products.length !== uniqueProductIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    return products;
  }
}
