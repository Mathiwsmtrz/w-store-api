import { PaymentsController } from './payments.controller';
import { WompiPaymentsService } from '../../../application/payments/services/wompi-payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let wompiPaymentsService: jest.Mocked<WompiPaymentsService>;

  beforeEach(() => {
    wompiPaymentsService = {
      createTransaction: jest.fn(),
      processWebhook: jest.fn(),
    } as unknown as jest.Mocked<WompiPaymentsService>;

    controller = new PaymentsController(wompiPaymentsService);
  });

  it('delegates createTransaction using dto orderCode', async () => {
    const expected = { reference: 'ORD-1-1000' };
    wompiPaymentsService.createTransaction.mockResolvedValue(expected as never);

    await expect(
      controller.createTransaction({ orderCode: 'ORD-1' }),
    ).resolves.toEqual(expected);
    expect(wompiPaymentsService.createTransaction).toHaveBeenCalledWith(
      'ORD-1',
    );
  });

  it('delegates processWebhook', async () => {
    const payload = { data: { transaction: { reference: 'R-1' } } };
    const expected = { ok: true };
    wompiPaymentsService.processWebhook.mockResolvedValue(expected as never);

    await expect(controller.processWebhook(payload as never)).resolves.toEqual(
      expected,
    );
    expect(wompiPaymentsService.processWebhook).toHaveBeenCalledWith(payload);
  });
});
