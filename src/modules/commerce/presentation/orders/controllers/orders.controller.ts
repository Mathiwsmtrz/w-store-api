import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from '../../../application/orders/dto/create-order.dto';
import { OrdersService } from '../../../application/orders/services/orders.service';

@ApiTags('orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order in PENDING_PAID status' })
  @Post('new-order')
  newOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createNewOrder(dto);
  }

  @ApiOperation({ summary: 'Search an order by code' })
  @ApiParam({ name: 'code', description: 'Order code' })
  @Get('orders/:code')
  async searchOrder(@Param('code') code: string) {
    const order = await this.ordersService.searchOrderByCode(code);
    if (!order) {
      throw new NotFoundException(`Order with code ${code} not found`);
    }

    return order;
  }
}
