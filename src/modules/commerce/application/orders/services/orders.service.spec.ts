import { NotFoundException } from '@nestjs/common';
import { OrderMethod } from '../../../domain/orders/enums/order-method.enum';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const dataSource = {
    createQueryRunner: jest.fn(),
  };
  const customersService = {
    getOrCreateByEmailWithAddress: jest.fn(),
  };
  const productsService = {
    findProductsByIdsOrFail: jest.fn(),
  };
  const orderRepo = {
    findOne: jest.fn(),
    exists: jest.fn(),
  };

  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(
      dataSource as never,
      customersService as never,
      productsService as never,
      orderRepo as never,
    );
  });

  it('creates a WOMPI order and commits transaction', async () => {
    type SavePayload = { code?: string } | unknown[];
    const manager = {
      create: jest
        .fn()
        .mockImplementation((_entity: unknown, payload: SavePayload) => ({
          ...(payload as object),
        })),
      save: jest.fn().mockImplementation(async (payload: SavePayload) => {
        if (Array.isArray(payload)) {
          return payload;
        }
        const obj = payload as { code?: string };
        if (obj.code) {
          return { id: 10, ...obj };
        }
        return payload;
      }),
      getRepository: jest.fn().mockReturnValue({
        exists: jest.fn().mockResolvedValue(false),
      }),
    };
    const runner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
    };
    dataSource.createQueryRunner.mockReturnValue(runner);
    customersService.getOrCreateByEmailWithAddress.mockResolvedValue({
      id: 77,
    });
    productsService.findProductsByIdsOrFail.mockResolvedValue([
      { id: 1, price: '100.00', productFee: '10.00', deliveryFee: '5.00' },
    ]);
    const orderResult = { id: 10, code: '123456' };
    const searchSpy = jest
      .spyOn(service, 'searchOrderByCode')
      .mockResolvedValue(orderResult as never);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = await service.createNewOrder({
      customer: {
        fullname: 'John',
        email: 'john@example.com',
        address: { address: 'Street 1' },
      },
      method: OrderMethod.WOMPI,
      items: [{ productId: 1, quantity: 2 }],
    } as never);

    expect(result).toEqual(orderResult);
    expect(runner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalledWith('100000');
    (Math.random as jest.Mock).mockRestore();
  });

  it('creates COD payment when paymentRefCode is provided', async () => {
    type SavePayload = { code?: string } | unknown[];
    const manager = {
      create: jest
        .fn()
        .mockImplementation((_entity: unknown, payload: SavePayload) => ({
          ...(payload as object),
        })),
      save: jest.fn().mockImplementation(async (payload: SavePayload) => {
        const obj = payload as { code?: string };
        if (obj.code) {
          return { id: 11, ...obj };
        }
        return payload;
      }),
      getRepository: jest.fn().mockReturnValue({
        exists: jest.fn().mockResolvedValue(false),
      }),
    };
    const runner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
    };
    dataSource.createQueryRunner.mockReturnValue(runner);
    customersService.getOrCreateByEmailWithAddress.mockResolvedValue({ id: 8 });
    productsService.findProductsByIdsOrFail.mockResolvedValue([
      { id: 2, price: '50.00', productFee: '5.00', deliveryFee: '3.00' },
    ]);
    jest
      .spyOn(service, 'searchOrderByCode')
      .mockResolvedValue({ id: 11 } as never);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    await service.createNewOrder({
      customer: {
        fullname: 'COD',
        email: 'cod@example.com',
        address: { address: 'Street 2' },
      },
      method: OrderMethod.COD,
      paymentRefCode: 'CASH-1',
      items: [{ productId: 2 }],
    } as never);

    expect(manager.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        provider: 'COD',
        paymentRefCode: 'CASH-1',
      }),
    );
    (Math.random as jest.Mock).mockRestore();
  });

  it('rolls back transaction when product is missing', async () => {
    const manager = {
      create: jest
        .fn()
        .mockImplementation((_entity: unknown, payload: unknown) => ({
          ...(payload as object),
        })),
      save: jest.fn(),
      getRepository: jest.fn().mockReturnValue({
        exists: jest.fn().mockResolvedValue(false),
      }),
    };
    const runner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
    };
    dataSource.createQueryRunner.mockReturnValue(runner);
    customersService.getOrCreateByEmailWithAddress.mockResolvedValue({
      id: 10,
    });
    productsService.findProductsByIdsOrFail.mockResolvedValue([] as never);

    await expect(
      service.createNewOrder({
        customer: {
          fullname: 'Fail',
          email: 'fail@example.com',
          address: { address: 'Street 3' },
        },
        method: OrderMethod.COD,
        items: [{ productId: 999 }],
      } as never),
    ).rejects.toThrow(NotFoundException);

    expect(runner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(runner.commitTransaction).not.toHaveBeenCalled();
  });

  it('searches order by code with full relations', async () => {
    orderRepo.findOne.mockResolvedValue({ code: '111111' });

    await expect(service.searchOrderByCode('111111')).resolves.toEqual({
      code: '111111',
    });
    expect(orderRepo.findOne).toHaveBeenCalledWith({
      where: { code: '111111' },
      relations: {
        customer: { addresses: true },
        details: { product: { category: true } },
        payments: true,
      },
    });
  });

  it('generateOrderCode returns fallback when all attempts are busy', async () => {
    const fakeRepository = {
      exists: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(Date, 'now').mockReturnValue(1700000012345);

    const generateOrderCode = (
      service as unknown as {
        generateOrderCode: (repo: { exists: jest.Mock }) => Promise<string>;
      }
    ).generateOrderCode;
    const code = await generateOrderCode(fakeRepository);

    expect(code).toBe('00012345');
    expect(fakeRepository.exists).toHaveBeenCalledTimes(10);
    (Date.now as jest.Mock).mockRestore();
  });
});
