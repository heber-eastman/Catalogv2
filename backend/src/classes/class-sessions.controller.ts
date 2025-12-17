import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Body,
  Req,
  UseGuards,
  Post,
  Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { OrganizationsGuard } from '../organizations/organizations.guard';
import {
  ClassSessionsService,
  UpdateSessionDto,
} from './class-sessions.service';
import { ClassRosterService, NewCustomerPayload } from './class-roster.service';
import { ClassAttendanceStatus } from '@prisma/client';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('classes/sessions')
export class ClassSessionsController {
  constructor(
    private readonly sessionsService: ClassSessionsService,
    private readonly rosterService: ClassRosterService,
  ) {}

  private getOrganizationId(req: Request): string {
    return req.organization?.id as string;
  }

  private getUserId(req: Request): string | undefined {
    return req.user?.id;
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
      room: query.room,
      status: query.status as any,
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

  @Post(':id/participants')
  async addParticipant(
    @Req() req: Request,
    @Param('id') sessionId: string,
    @Body()
    body:
      | { customerProfileId: string; status?: ClassAttendanceStatus }
      | { newCustomer: NewCustomerPayload },
  ) {
    const organizationId = this.getOrganizationId(req);
    const actingUserId = this.getUserId(req);

    if ('customerProfileId' in body && body.customerProfileId) {
      await this.rosterService.addExistingParticipant(
        sessionId,
        organizationId,
        body.customerProfileId,
        body.status ?? ClassAttendanceStatus.REGISTERED,
        actingUserId,
      );
    } else if ('newCustomer' in body && body.newCustomer) {
      await this.rosterService.addNewCustomerAndParticipant(
        sessionId,
        organizationId,
        body.newCustomer,
        actingUserId,
      );
    } else {
      throw new Error('Invalid participant payload');
    }

    return this.sessionsService.findOneWithRoster(sessionId, organizationId);
  }

  @Patch(':id/participants/:participantId')
  async updateParticipant(
    @Req() req: Request,
    @Param('id') sessionId: string,
    @Param('participantId') participantId: string,
    @Body()
    body: { status: ClassAttendanceStatus; note?: string },
  ) {
    const organizationId = this.getOrganizationId(req);
    const actingUserId = this.getUserId(req);

    await this.rosterService.updateParticipantStatus(
      sessionId,
      organizationId,
      participantId,
      body.status,
      body.note,
      actingUserId,
    );

    return this.sessionsService.findOneWithRoster(sessionId, organizationId);
  }

  @Delete(':id/participants/:participantId')
  async removeParticipant(
    @Req() req: Request,
    @Param('id') sessionId: string,
    @Param('participantId') participantId: string,
  ) {
    const organizationId = this.getOrganizationId(req);

    await this.rosterService.removeParticipant(
      sessionId,
      organizationId,
      participantId,
    );

    return this.sessionsService.findOneWithRoster(sessionId, organizationId);
  }
}
