import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { OrganizationsService } from './organizations.service';

@Injectable()
export class OrganizationsGuard implements CanActivate {
  constructor(private readonly organizationsService: OrganizationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User context missing');
    }

    const explicitSlugHeader = request.headers['x-catalog-organization'];
    const explicitSlug = Array.isArray(explicitSlugHeader)
      ? explicitSlugHeader[0]
      : explicitSlugHeader;

    const { organization, membership } =
      await this.organizationsService.ensureRequestContext(
        request.headers.host,
        user.id,
        explicitSlug,
      );

    request.organization = organization;
    request.organizationMembership = membership;
    return true;
  }
}
