import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrganizationsService } from './organizations.service';
import { OrganizationsGuard } from './organizations.guard';

@Module({
  imports: [ConfigModule],
  providers: [OrganizationsService, OrganizationsGuard],
  exports: [OrganizationsService, OrganizationsGuard],
})
export class OrganizationsModule {}
