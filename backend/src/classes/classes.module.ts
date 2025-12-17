import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { ClassTemplatesService } from './class-templates.service';
import { ClassTemplatesController } from './class-templates.controller';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionsController } from './class-sessions.controller';
import { ClassRosterService } from './class-roster.service';
import { CustomersService } from '../customers/customers.service';
import { ClassLookupsController } from './class-lookups.controller';
import { ClassLookupsService } from './class-lookups.service';

@Module({
  imports: [PrismaModule, AuthModule, OrganizationsModule],
  controllers: [
    ClassTemplatesController,
    ClassSessionsController,
    ClassLookupsController,
  ],
  providers: [
    ClassTemplatesService,
    ClassSessionsService,
    ClassRosterService,
    CustomersService,
    ClassLookupsService,
  ],
  exports: [ClassTemplatesService, ClassSessionsService, ClassRosterService],
})
export class ClassesModule {}
