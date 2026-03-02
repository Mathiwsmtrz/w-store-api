import { NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { CustomerAddressEntity } from '../../../infrastructure/customers/typeorm/entities/customer-address.entity';
import { CustomerEntity } from '../../../infrastructure/customers/typeorm/entities/customer.entity';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  let service: CustomersService;

  const customerRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const customerAddressRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CustomersService(
      customerRepo as never,
      customerAddressRepo as never,
    );
  });

  it('creates customer and address when customer does not exist', async () => {
    customerRepo.findOne.mockResolvedValueOnce(null);
    customerRepo.create.mockReturnValue({
      fullname: 'John Doe',
      email: 'john@example.com',
    });
    customerRepo.save.mockResolvedValue({ id: 1, email: 'john@example.com' });
    customerAddressRepo.findOne.mockResolvedValue(null);
    customerAddressRepo.create.mockReturnValue({ address: 'Main st 1' });
    customerAddressRepo.save.mockResolvedValue({ id: 99 });

    const result = await service.getOrCreateByEmailWithAddress({
      fullname: 'John Doe',
      email: '  JOHN@EXAMPLE.COM ',
      address: { address: ' Main st 1 ' },
    });

    expect(result).toEqual({ id: 1, email: 'john@example.com' });
    expect(customerRepo.create).toHaveBeenCalledWith({
      fullname: 'John Doe',
      email: 'john@example.com',
    });
    expect(customerAddressRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        address: 'Main st 1',
      }),
    );
  });

  it('returns existing customer and does not create address when address already exists', async () => {
    customerRepo.findOne.mockResolvedValue({
      id: 7,
      email: 'jane@example.com',
    });
    customerAddressRepo.findOne.mockResolvedValue({ id: 12 });

    const result = await service.getOrCreateByEmailWithAddress({
      fullname: 'Jane Doe',
      email: 'jane@example.com',
      address: { address: 'Street 44' },
    });

    expect(result).toEqual({ id: 7, email: 'jane@example.com' });
    expect(customerAddressRepo.save).not.toHaveBeenCalled();
  });

  it('recovers after unique violation and fetches existing customer', async () => {
    customerRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 22, email: 'dupe@example.com' });
    customerRepo.create.mockReturnValue({ email: 'dupe@example.com' });
    const uniqueError = new QueryFailedError(
      'insert',
      [],
      new Error('dup'),
    ) as QueryFailedError & { code?: string };
    uniqueError.code = '23505';
    customerRepo.save.mockRejectedValue(uniqueError);
    customerAddressRepo.findOne.mockResolvedValue({ id: 3 });

    const result = await service.getOrCreateByEmailWithAddress({
      fullname: 'Dupe',
      email: 'dupe@example.com',
      address: { address: 'Addr 1' },
    });

    expect(result).toEqual({ id: 22, email: 'dupe@example.com' });
  });

  it('throws NotFoundException when customer cannot be found after unique violation', async () => {
    customerRepo.findOne.mockResolvedValue(null);
    customerRepo.create.mockReturnValue({ email: 'none@example.com' });
    const uniqueError = new QueryFailedError(
      'insert',
      [],
      new Error('dup'),
    ) as QueryFailedError & { code?: string };
    uniqueError.code = '23505';
    customerRepo.save.mockRejectedValue(uniqueError);

    await expect(
      service.getOrCreateByEmailWithAddress({
        fullname: 'None',
        email: 'none@example.com',
        address: { address: 'Addr 2' },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rethrows non-unique save errors', async () => {
    customerRepo.findOne.mockResolvedValue(null);
    customerRepo.create.mockReturnValue({ email: 'x@example.com' });
    customerRepo.save.mockRejectedValue(new Error('boom'));

    await expect(
      service.getOrCreateByEmailWithAddress({
        fullname: 'X',
        email: 'x@example.com',
        address: { address: 'Addr 3' },
      }),
    ).rejects.toThrow('boom');
  });

  it('uses manager repositories when manager is provided', async () => {
    const managerCustomerRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1, email: 'm@example.com' }),
    };
    const managerAddressRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 2 }),
    };
    const manager = {
      getRepository: jest.fn().mockImplementation((entity: unknown) => {
        if (entity === CustomerEntity) {
          return managerCustomerRepo;
        }
        if (entity === CustomerAddressEntity) {
          return managerAddressRepo;
        }
        return null;
      }),
    };

    const result = await service.getOrCreateByEmailWithAddress(
      {
        fullname: 'Managed',
        email: 'm@example.com',
        address: { address: 'M' },
      },
      manager as never,
    );

    expect(result).toEqual({ id: 1, email: 'm@example.com' });
    expect(manager.getRepository).toHaveBeenCalledWith(CustomerEntity);
    expect(manager.getRepository).toHaveBeenCalledWith(CustomerAddressEntity);
  });
});
