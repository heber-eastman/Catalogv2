import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CreateMembershipPlanDto,
  MembershipPlansService,
  UpdateMembershipPlanDto,
} from './membership-plans.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { OrganizationsGuard } from '../../../organizations/organizations.guard';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('settings/customers/membership-plans')
export class MembershipPlansController {
  constructor(
    private readonly membershipPlansService: MembershipPlansService,
  ) {}

  private getOrganizationId(req: Request) {
    const orgId = req.organization?.id;
    if (!orgId) {
      throw new UnauthorizedException('Organization context missing');
    }
    return orgId;
  }

  @Get()
  list(@Req() req: Request) {
    return this.membershipPlansService.listPlans(this.getOrganizationId(req));
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateMembershipPlanDto) {
    return this.membershipPlansService.createPlan(
      this.getOrganizationId(req),
      body,
    );
  }

  @Patch(':planId')
  update(
    @Req() req: Request,
    @Param('planId') planId: string,
    @Body() body: UpdateMembershipPlanDto,
  ) {
    return this.membershipPlansService.updatePlan(
      this.getOrganizationId(req),
      planId,
      body,
    );
  }

  @Delete(':planId')
  remove(@Req() req: Request, @Param('planId') planId: string) {
    return this.membershipPlansService.deletePlan(
      this.getOrganizationId(req),
      planId,
    );
  }
}
