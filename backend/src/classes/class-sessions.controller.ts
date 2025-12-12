import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { OrganizationsGuard } from '../organizations/organizations.guard';
import {
  ClassSessionsService,
  UpdateSessionDto,
} from './class-sessions.service';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('api/classes/sessions')
export class ClassSessionsController {
  constructor(private readonly sessionsService: ClassSessionsService) {}

  private getOrganizationId(req: Request): string {
    return req.organization?.id as string;
  }

  @Get()
  findInRange(@Req() req: Request, @Query() query: Record<string, string>) {
    const organizationId = this.getOrganizationId(req);
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    return this.sessionsService.findInRange({
      organizationId,
      startDate,
      endDate,
      locationId: query.locationId,
      program: query.program,
      instructorUserId: query.instructorUserId,
    });
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const organizationId = this.getOrganizationId(req);
    return this.sessionsService.findOneWithRoster(id, organizationId);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateSessionDto,
  ) {
    const organizationId = this.getOrganizationId(req);
    return this.sessionsService.updateSession(id, organizationId, body);
  }
}
