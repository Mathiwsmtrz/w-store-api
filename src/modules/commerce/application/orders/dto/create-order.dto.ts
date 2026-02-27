import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderMethod } from '../../../domain/orders/enums/order-method.enum';

export class CreateOrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}

export class CreateOrderCustomerAddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;
}

export class CreateOrderCustomerDto {
  @ValidateNested()
  @Type(() => CreateOrderCustomerAddressDto)
  address: CreateOrderCustomerAddressDto;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  email: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CreateOrderCustomerDto)
  customer: CreateOrderCustomerDto;

  @IsEnum(OrderMethod)
  method: OrderMethod;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  paymentRefCode?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
