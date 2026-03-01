import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateWompiTransactionDto } from '../../../application/payments/dto/create-wompi-transaction.dto';
import { WompiWebhookPayload } from '../../../application/payments/dto/wompi-webhook.dto';
import { WompiPaymentsService } from '../../../application/payments/services/wompi-payments.service';

@ApiTags('payments')
@Controller('payments/wompi')
export class PaymentsController {
  constructor(private readonly wompiPaymentsService: WompiPaymentsService) {}

  @ApiOperation({ summary: 'Create Wompi widget transaction data' })
  @Post('transaction')
  createTransaction(@Body() dto: CreateWompiTransactionDto) {
    return this.wompiPaymentsService.createTransaction(dto.orderCode);
  }

  @ApiOperation({ summary: 'Receive Wompi webhook events' })
  @HttpCode(200)
  @Post('webhook')
  processWebhook(@Body() payload: WompiWebhookPayload) {
    return this.wompiPaymentsService.processWebhook(payload);
  }
}
