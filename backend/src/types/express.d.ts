import { Organization, OrganizationUser, User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      organization?: Organization;
      organizationMembership?: OrganizationUser;
    }
  }
}

export {};
