import { CatalogController } from './catalog.controller';
import { ProductsService } from '../../../application/products/services/products.service';

describe('CatalogController', () => {
  let controller: CatalogController;
  let productsService: jest.Mocked<ProductsService>;

  beforeEach(() => {
    productsService = {
      listCategories: jest.fn(),
      listProducts: jest.fn(),
      getProductBySlug: jest.fn(),
      findProductsByIdsOrFail: jest.fn(),
    } as unknown as jest.Mocked<ProductsService>;

    controller = new CatalogController(productsService);
  });

  it('delegates listCategories to products service', async () => {
    const expected = [{ id: 1, name: 'Beverages' }];
    productsService.listCategories.mockResolvedValue(expected as never);

    await expect(controller.listCategories()).resolves.toEqual(expected);
    expect(productsService.listCategories).toHaveBeenCalledTimes(1);
  });

  it('delegates listProducts with optional category', async () => {
    const expected = [{ id: 11, slug: 'iced-coffee' }];
    productsService.listProducts.mockResolvedValue(expected as never);

    await expect(
      controller.listProducts({ category: 'drinks' }),
    ).resolves.toEqual(expected);
    expect(productsService.listProducts).toHaveBeenCalledWith('drinks');
  });

  it('delegates getProductBySlug', async () => {
    const expected = { id: 2, slug: 'combo-1' };
    productsService.getProductBySlug.mockResolvedValue(expected as never);

    await expect(controller.getProductBySlug('combo-1')).resolves.toEqual(
      expected,
    );
    expect(productsService.getProductBySlug).toHaveBeenCalledWith('combo-1');
  });
});
