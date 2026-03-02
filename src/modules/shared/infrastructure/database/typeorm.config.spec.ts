import { ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './typeorm.config';

describe('getTypeOrmConfig', () => {
  it('uses DATABASE_URL when available', () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'DATABASE_URL') {
          return 'postgres://postgres:postgres@localhost:5432/store';
        }
        if (key === 'DB_SYNCHRONIZE') {
          return 'true';
        }
        return undefined;
      }),
    } as unknown as ConfigService;

    const result = getTypeOrmConfig(configService);

    expect(result).toEqual(
      expect.objectContaining({
        type: 'postgres',
        url: 'postgres://postgres:postgres@localhost:5432/store',
        synchronize: true,
        autoLoadEntities: true,
      }),
    );
  });

  it('uses host config when url is not available', () => {
    const values: Record<string, string | undefined> = {
      DB_HOST: 'db-host',
      DB_PORT: '6543',
      DB_USERNAME: 'db-user',
      DB_PASSWORD: 'db-pass',
      DB_DATABASE: 'store_back',
      DB_SYNCHRONIZE: 'false',
    };
    const configService = {
      get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
    } as unknown as ConfigService;

    const result = getTypeOrmConfig(configService);

    expect(result).toEqual(
      expect.objectContaining({
        type: 'postgres',
        host: 'db-host',
        port: 6543,
        username: 'db-user',
        password: 'db-pass',
        database: 'store_back',
        synchronize: false,
      }),
    );
  });
});
