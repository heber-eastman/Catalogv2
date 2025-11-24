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
  LocationsService,
  CreateLocationDto,
  UpdateLocationDto,
} from './locations.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { OrganizationsGuard } from '../../../organizations/organizations.guard';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('settings/customers/locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  private getOrganizationId(req: Request) {
    const orgId = req.organization?.id;
    if (!orgId) {
      throw new UnauthorizedException('Organization context missing');
    }
    return orgId;
  }

  @Get()
  list(@Req() req: Request) {
    return this.locationsService.listLocations(this.getOrganizationId(req));
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateLocationDto) {
    return this.locationsService.createLocation(
      this.getOrganizationId(req),
      body,
    );
  }

  @Patch(':locationId')
  update(
    @Req() req: Request,
    @Param('locationId') locationId: string,
    @Body() body: UpdateLocationDto,
  ) {
    return this.locationsService.updateLocation(
      this.getOrganizationId(req),
      locationId,
      body,
    );
  }

  @Delete(':locationId')
  remove(@Req() req: Request, @Param('locationId') locationId: string) {
    return this.locationsService.deleteLocation(
      this.getOrganizationId(req),
      locationId,
    );
  }
}
