import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { OrganizationsGuard } from '../organizations/organizations.guard';
import { ClassLookupsService } from './class-lookups.service';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('classes/lookups')
export class ClassLookupsController {
  constructor(private readonly lookupsService: ClassLookupsService) {}

  private getOrganizationId(req: Request): string {
    return req.organization?.id as string;
  }

  @Get('locations')
  getLocations(@Req() req: Request) {
    return this.lookupsService.getLocations(this.getOrganizationId(req));
  }

  @Get('instructors')
  getInstructors(@Req() req: Request) {
    return this.lookupsService.getInstructors(this.getOrganizationId(req));
  }

  @Get('programs')
  getPrograms(@Req() req: Request) {
    return this.lookupsService.getPrograms(this.getOrganizationId(req));
  }

  @Get('rooms')
  getRooms(@Req() req: Request) {
    return this.lookupsService.getRooms(this.getOrganizationId(req));
  }
}
