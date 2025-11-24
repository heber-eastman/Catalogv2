import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AssignMembershipDto {
  membershipPlanId: string;
  startDate: Date | string;
  status?: MembershipStatus;
  endDate?: Date | string | null;
  renewalDate?: Date | string | null;
  externalSubscriptionId?: string | null;
}

export type UpdateMembershipDto = Partial<
  AssignMembershipDto & {
    cancelReasonId?: string | null;
    freezeReasonId?: string | null;
    freezeStartDate?: Date | string | null;
    freezeEndDate?: Date | string | null;
  }
>;

const toDate = (value?: Date | string | null) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value instanceof Date ? value : new Date(value);
};

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  getMembershipForHead(organizationId: string, headCustomerProfileId: string) {
    return this.prisma.membership.findFirst({
      where: { organizationId, headCustomerProfileId },
      include: {
        membershipPlan: true,
      },
    });
  }

  assignMembership(
    organizationId: string,
    headCustomerProfileId: string,
    dto: AssignMembershipDto,
  ) {
    return this.prisma.membership.create({
      data: {
        organizationId,
        headCustomerProfileId,
        membershipPlanId: dto.membershipPlanId,
        status: dto.status ?? MembershipStatus.ACTIVE,
        startDate: toDate(dto.startDate) ?? new Date(),
        endDate: toDate(dto.endDate),
        renewalDate: toDate(dto.renewalDate),
        externalSubscriptionId: dto.externalSubscriptionId ?? undefined,
      },
    });
  }

  async updateMembership(
    organizationId: string,
    headCustomerProfileId: string,
    membershipId: string,
    dto: UpdateMembershipDto,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: { organizationId, headCustomerProfileId, id: membershipId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return this.prisma.membership.update({
      where: { id: membershipId },
      data: {
        ...dto,
        startDate: toDate(dto.startDate),
        endDate: toDate(dto.endDate),
        renewalDate: toDate(dto.renewalDate),
        freezeStartDate: toDate(dto.freezeStartDate),
        freezeEndDate: toDate(dto.freezeEndDate),
      },
    });
  }
}
