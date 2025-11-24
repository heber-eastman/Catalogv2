import { Module } from '@nestjs/common';
import { MembershipPlansService } from './membership-plans.service';
import { MembershipPlansController } from './membership-plans.controller';
import { AuthModule } from '../../../auth/auth.module';
import { OrganizationsModule } from '../../../organizations/organizations.module';

@Module({
  imports: [AuthModule, OrganizationsModule],
  providers: [MembershipPlansService],
  controllers: [MembershipPlansController],
  exports: [MembershipPlansService],
})
export class MembershipPlansModule {}
