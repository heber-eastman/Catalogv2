import { Module } from '@nestjs/common';
import { LocationsModule } from './locations/locations.module';
import { MembershipPlansModule } from './membership-plans/membership-plans.module';
import { StatusReasonsModule } from './status-reasons/status-reasons.module';

@Module({
  imports: [LocationsModule, MembershipPlansModule, StatusReasonsModule],
  exports: [LocationsModule, MembershipPlansModule, StatusReasonsModule],
})
export class CustomerSettingsModule {}
