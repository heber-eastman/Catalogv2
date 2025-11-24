import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HouseholdMemberPayload {
  customerProfileId: string;
  relationship?: string;
}

@Injectable()
export class HouseholdsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHouseholdForCustomer(
    organizationId: string,
    headCustomerProfileId: string,
  ) {
    return this.prisma.household.findFirst({
      where: { organizationId, headCustomerProfileId },
      include: {
        headCustomerProfile: true,
        members: {
          include: {
            customerProfile: true,
          },
        },
      },
    });
  }

  async createHousehold(organizationId: string, headCustomerProfileId: string) {
    const existing = await this.prisma.household.findFirst({
      where: { organizationId, headCustomerProfileId },
    });

    if (existing) {
      throw new ConflictException('Head customer already has a household');
    }

    return this.prisma.household.create({
      data: { organizationId, headCustomerProfileId },
    });
  }

  private async findHouseholdOrThrow(
    organizationId: string,
    headCustomerProfileId: string,
  ) {
    const household = await this.prisma.household.findFirst({
      where: { organizationId, headCustomerProfileId },
    });

    if (!household) {
      throw new NotFoundException('Household not found for customer');
    }

    return household;
  }

  async addMember(
    organizationId: string,
    headCustomerProfileId: string,
    payload: HouseholdMemberPayload,
  ) {
    const household = await this.findHouseholdOrThrow(
      organizationId,
      headCustomerProfileId,
    );

    return this.prisma.householdMember.create({
      data: {
        organizationId,
        householdId: household.id,
        customerProfileId: payload.customerProfileId,
        relationship: payload.relationship,
      },
    });
  }

  async removeMember(
    organizationId: string,
    headCustomerProfileId: string,
    householdMemberId: string,
  ) {
    const household = await this.findHouseholdOrThrow(
      organizationId,
      headCustomerProfileId,
    );

    const member = await this.prisma.householdMember.findFirst({
      where: {
        id: householdMemberId,
        householdId: household.id,
        organizationId,
      },
    });

    if (!member) {
      throw new NotFoundException('Household member not found');
    }

    return this.prisma.householdMember.delete({
      where: { id: householdMemberId },
    });
  }
}
