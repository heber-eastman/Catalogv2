import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { HouseholdsService } from './households.service';
import { MembershipsService } from './memberships.service';
import { InteractionsService } from './interactions.service';
import { CommsService } from './comms.service';
import { BillingService } from './billing.service';
import { FilesService, S3_CLIENT } from './files.service';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    HouseholdsService,
    MembershipsService,
    InteractionsService,
    CommsService,
    BillingService,
    FilesService,
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const region = config.get<string>('S3_REGION') ?? 'us-east-1';
        return new S3Client({ region });
      },
    },
  ],
  exports: [
    CustomersService,
    HouseholdsService,
    MembershipsService,
    InteractionsService,
    CommsService,
    BillingService,
    FilesService,
  ],
})
export class CustomersModule {}
