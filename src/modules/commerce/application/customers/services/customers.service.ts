import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { CustomerEntity } from '../../../infrastructure/customers/typeorm/entities/customer.entity';
import { CustomerAddressEntity } from '../../../infrastructure/customers/typeorm/entities/customer-address.entity';

type UpsertCustomerAddressInput = {
  address: string;
  city?: string;
  state?: string;
  country?: string;
};

type UpsertCustomerInput = {
  fullname: string;
  email: string;
  address: UpsertCustomerAddressInput;
};

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(CustomerAddressEntity)
    private readonly customerAddressRepo: Repository<CustomerAddressEntity>,
  ) {}

  async getOrCreateByEmailWithAddress(
    input: UpsertCustomerInput,
    manager?: EntityManager,
  ): Promise<CustomerEntity> {
    const customerRepo = manager
      ? manager.getRepository(CustomerEntity)
      : this.customerRepo;
    const customerAddressRepo = manager
      ? manager.getRepository(CustomerAddressEntity)
      : this.customerAddressRepo;

    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedAddress = input.address.address.trim();

    let customer = await customerRepo.findOne({
      where: { email: normalizedEmail },
    });

    if (!customer) {
      try {
        customer = await customerRepo.save(
          customerRepo.create({
            fullname: input.fullname,
            email: normalizedEmail,
          }),
        );
      } catch (error) {
        if (
          error instanceof QueryFailedError &&
          (error as { code?: string }).code === '23505'
        ) {
          customer = await customerRepo.findOne({
            where: { email: normalizedEmail },
          });
        } else {
          throw error;
        }
      }
    }

    if (!customer) {
      throw new NotFoundException(
        `Customer with email ${normalizedEmail} not found`,
      );
    }

    const existingAddress = await customerAddressRepo.findOne({
      where: {
        customer: { id: customer.id },
        address: normalizedAddress,
      },
    });

    if (!existingAddress) {
      await customerAddressRepo.save(
        customerAddressRepo.create({
          customer,
          address: normalizedAddress,
          city: input.address.city,
          state: input.address.state,
          country: input.address.country,
        }),
      );
    }

    return customer;
  }
}
