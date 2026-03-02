import { NotFoundException } from '@nestjs/common';
import { ProductEntity } from '../../../infrastructure/products/typeorm/entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const categoryRepo = {
    find: jest.fn(),
  };

  const productRepo = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(categoryRepo as never, productRepo as never);
  });

  it('lists categories ordered by name', async () => {
    const categories = [{ id: 1, name: 'A' }];
    categoryRepo.find.mockResolvedValue(categories);

    await expect(service.listCategories()).resolves.toEqual(categories);
    expect(categoryRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  it('lists products without category filter', async () => {
    const result = [{ id: 10 }];
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(result),
    };
    productRepo.createQueryBuilder.mockReturnValue(qb);

    await expect(service.listProducts()).resolves.toEqual(result);
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('filters products by numeric category id', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    productRepo.createQueryBuilder.mockReturnValue(qb);

    await service.listProducts('15');

    expect(qb.andWhere).toHaveBeenCalledWith('category.id = :categoryId', {
      categoryId: 15,
    });
  });

  it('filters products by category slug', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    productRepo.createQueryBuilder.mockReturnValue(qb);

    await service.listProducts('desserts');

    expect(qb.andWhere).toHaveBeenCalledWith('category.slug = :categorySlug', {
      categorySlug: 'desserts',
    });
  });

  it('returns product by slug when found', async () => {
    const product = { id: 20, slug: 'cake' };
    productRepo.findOne.mockResolvedValue(product);

    await expect(service.getProductBySlug('cake')).resolves.toEqual(product);
    expect(productRepo.findOne).toHaveBeenCalledWith({
      where: { slug: 'cake' },
      relations: ['category'],
    });
  });

  it('throws NotFoundException when slug does not exist', async () => {
    productRepo.findOne.mockResolvedValue(null);

    await expect(service.getProductBySlug('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('finds products by ids with manager and unique ids', async () => {
    const managerRepo = {
      findBy: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    };
    const manager = {
      getRepository: jest.fn().mockReturnValue(managerRepo),
    };

    const result = await service.findProductsByIdsOrFail(
      [1, 2, 2],
      manager as never,
    );

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    expect(manager.getRepository).toHaveBeenCalledWith(ProductEntity);
    expect(managerRepo.findBy).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when any requested product is missing', async () => {
    productRepo.findBy.mockResolvedValue([{ id: 1 }]);

    await expect(service.findProductsByIdsOrFail([1, 2])).rejects.toThrow(
      NotFoundException,
    );
  });
});
