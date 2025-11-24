import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CreateStatusReasonDto,
  StatusReasonsService,
  UpdateStatusReasonDto,
} from './status-reasons.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { OrganizationsGuard } from '../../../organizations/organizations.guard';
import { StatusReasonType } from '@prisma/client';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('settings/customers/status-reasons')
export class StatusReasonsController {
  constructor(private readonly statusReasonsService: StatusReasonsService) {}

  private getOrganizationId(req: Request) {
    const orgId = req.organization?.id;
    if (!orgId) {
      throw new UnauthorizedException('Organization context missing');
    }
    return orgId;
  }

  @Get()
  list(@Req() req: Request, @Query('type') type?: StatusReasonType) {
    return this.statusReasonsService.listReasons(
      this.getOrganizationId(req),
      type as StatusReasonType,
    );
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateStatusReasonDto) {
    return this.statusReasonsService.createReason(
      this.getOrganizationId(req),
      body,
    );
  }

  @Patch(':reasonId')
  update(
    @Req() req: Request,
    @Param('reasonId') reasonId: string,
    @Body() body: UpdateStatusReasonDto,
  ) {
    return this.statusReasonsService.updateReason(
      this.getOrganizationId(req),
      reasonId,
      body,
    );
  }

  @Delete(':reasonId')
  remove(@Req() req: Request, @Param('reasonId') reasonId: string) {
    return this.statusReasonsService.deleteReason(
      this.getOrganizationId(req),
      reasonId,
    );
  }
}
