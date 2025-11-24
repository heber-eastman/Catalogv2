import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  listBillingEvents(organizationId: string, customerProfileId: string) {
    return this.prisma.billingEvent.findMany({
      where: {
        organizationId,
        customerProfileId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}
