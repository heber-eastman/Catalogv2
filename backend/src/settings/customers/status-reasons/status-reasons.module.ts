import { Module } from '@nestjs/common';
import { StatusReasonsService } from './status-reasons.service';
import { StatusReasonsController } from './status-reasons.controller';
import { AuthModule } from '../../../auth/auth.module';
import { OrganizationsModule } from '../../../organizations/organizations.module';

@Module({
  imports: [AuthModule, OrganizationsModule],
  providers: [StatusReasonsService],
  controllers: [StatusReasonsController],
  exports: [StatusReasonsService],
})
export class StatusReasonsModule {}
