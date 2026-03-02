import { NotFoundException } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../../../application/orders/services/orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: jest.Mocked<OrdersService>;

  beforeEach(() => {
    ordersService = {
      createNewOrder: jest.fn(),
      searchOrderByCode: jest.fn(),
    } as unknown as jest.Mocked<OrdersService>;

    controller = new OrdersController(ordersService);
  });

  it('delegates order creation', async () => {
    const dto = { method: 'WOMPI' };
    const expected = { code: '123456' };
    ordersService.createNewOrder.mockResolvedValue(expected as never);

    await expect(controller.newOrder(dto as never)).resolves.toEqual(expected);
    expect(ordersService.createNewOrder).toHaveBeenCalledWith(dto);
  });

  it('returns order when found', async () => {
    const order = { code: '654321' };
    ordersService.searchOrderByCode.mockResolvedValue(order as never);

    await expect(controller.searchOrder('654321')).resolves.toEqual(order);
  });

  it('throws NotFoundException when order does not exist', async () => {
    ordersService.searchOrderByCode.mockResolvedValue(null as never);

    await expect(controller.searchOrder('000000')).rejects.toThrow(
      NotFoundException,
    );
  });
});
