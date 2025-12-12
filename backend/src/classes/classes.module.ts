import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClassTemplatesService } from './class-templates.service';
import { ClassTemplatesController } from './class-templates.controller';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionsController } from './class-sessions.controller';
import { ClassRosterService } from './class-roster.service';
import { CustomersService } from '../customers/customers.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClassTemplatesController, ClassSessionsController],
  providers: [
    ClassTemplatesService,
    ClassSessionsService,
    ClassRosterService,
    CustomersService,
  ],
  exports: [ClassTemplatesService, ClassSessionsService, ClassRosterService],
})
export class ClassesModule {}
