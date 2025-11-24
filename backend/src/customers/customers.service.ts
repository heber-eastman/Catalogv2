import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ListCustomersOptions {
  search?: string;
  statuses?: CustomerStatus[];
  locationId?: string;
  locationIds?: string[];
  membershipPlanIds?: string[];
  hasMembership?: boolean;
  tags?: string[];
}

export type CreateCustomerDto = Omit<
  Prisma.CustomerProfileUncheckedCreateInput,
  'id' | 'organizationId' | 'createdAt' | 'updatedAt'
>;

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async listCustomers(
    organizationId: string,
    options: ListCustomersOptions = {},
  ) {
    const where: Prisma.CustomerProfileWhereInput = {
      organizationId,
    };

    const searchTerm = options.search?.trim();
    if (searchTerm) {
      where.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { preferredName: { contains: searchTerm, mode: 'insensitive' } },
        { primaryEmail: { contains: searchTerm, mode: 'insensitive' } },
        { primaryPhone: { contains: searchTerm, mode: 'insensitive' } },
        { secondaryPhone: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (options.statuses?.length) {
      where.status = { in: options.statuses };
    }

    if (options.locationIds?.length) {
      where.primaryLocationId = { in: options.locationIds };
    } else if (options.locationId) {
      where.primaryLocationId = options.locationId;
    }

    if (options.tags?.length) {
      where.tags = { hasSome: options.tags };
    }

    if (options.membershipPlanIds?.length) {
      where.memberships = {
        some: { membershipPlanId: { in: options.membershipPlanIds } },
      };
    } else if (typeof options.hasMembership === 'boolean') {
      where.memberships = options.hasMembership ? { some: {} } : { none: {} };
    }

    return this.prisma.customerProfile.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        primaryLocation: {
          select: {
            id: true,
            name: true,
          },
        },
        memberships: {
          orderBy: [{ createdAt: 'desc' }],
          take: 1,
          include: {
            membershipPlan: {
              select: {
                id: true,
                name: true,
              },
            },
            cancelReason: true,
            freezeReason: true,
          },
        },
      },
    });
  }

  async getCustomerById(organizationId: string, id: string) {
    const customer = await this.prisma.customerProfile.findFirst({
      where: { id, organizationId },
      include: {
        primaryLocation: true,
        memberships: {
          orderBy: [{ createdAt: 'desc' }],
          include: {
            membershipPlan: true,
            cancelReason: true,
            freezeReason: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async createCustomer(organizationId: string, dto: CreateCustomerDto) {
    return this.prisma.customerProfile.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async updateCustomer(
    organizationId: string,
    id: string,
    dto: UpdateCustomerDto,
  ) {
    const existing = await this.prisma.customerProfile.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customerProfile.update({
      where: { id },
      data: dto,
    });
  }
}
