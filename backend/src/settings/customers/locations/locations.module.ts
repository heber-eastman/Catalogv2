import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { AuthModule } from '../../../auth/auth.module';
import { OrganizationsModule } from '../../../organizations/organizations.module';

@Module({
  imports: [AuthModule, OrganizationsModule],
  providers: [LocationsService],
  controllers: [LocationsController],
  exports: [LocationsService],
})
export class LocationsModule {}
