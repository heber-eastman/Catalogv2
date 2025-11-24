import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OrganizationsGuard } from '../organizations/organizations.guard';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    } as const;
  }
}
