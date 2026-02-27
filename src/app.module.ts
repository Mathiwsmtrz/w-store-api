import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommerceModule } from './modules/commerce/commerce.module';
import { DatabaseModule } from './modules/shared/infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    DatabaseModule,
    CommerceModule,
  ],
})
export class AppModule {}
