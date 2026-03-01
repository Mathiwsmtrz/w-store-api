import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWompiTransactionDto {
  @IsString()
  @IsNotEmpty()
  orderCode: string;
}
