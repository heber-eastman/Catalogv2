import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MembershipCadence,
  MembershipScopeType,
  MembershipTermType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CreateMembershipPlanDto {
  name: string;
  description?: string | null;
  cadence: MembershipCadence;
  priceCents: number;
  currency?: string;
  termType: MembershipTermType;
  termMonths?: number | null;
  hasIntroPeriod?: boolean;
  introMonths?: number | null;
  introPriceCents?: number | null;
  scopeType?: MembershipScopeType;
  locationIds?: string[];
  allowsFamilyMembership?: boolean;
  maxFamilySize?: number | null;
  isActive?: boolean;
}

export type UpdateMembershipPlanDto = Partial<CreateMembershipPlanDto>;

@Injectable()
export class MembershipPlansService {
  constructor(private readonly prisma: PrismaService) {}

  listPlans(organizationId: string) {
    return this.prisma.membershipPlan.findMany({
      where: { organizationId },
      include: {
        locations: {
          include: {
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPlan(organizationId: string, dto: CreateMembershipPlanDto) {
    this.validateCreatePayload(dto);

    const scopeType = dto.scopeType ?? MembershipScopeType.ORG_WIDE;
    const locationIds =
      scopeType === MembershipScopeType.SPECIFIC_LOCATIONS
        ? (dto.locationIds ?? [])
        : [];

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.membershipPlan.create({
        data: this.buildCreateData(organizationId, dto),
        include: { locations: true },
      });

      if (locationIds.length > 0) {
        await tx.membershipPlanLocation.createMany({
          data: locationIds.map((locationId) => ({
            membershipPlanId: plan.id,
            locationId,
          })),
        });
      }

      return plan;
    });
  }

  async updatePlan(
    organizationId: string,
    planId: string,
    dto: UpdateMembershipPlanDto,
  ) {
    const existing = await this.prisma.membershipPlan.findFirst({
      where: { id: planId, organizationId },
      include: { locations: true },
    });

    if (!existing) {
      throw new NotFoundException('Membership plan not found');
    }

    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw new BadRequestException('Plan name is required');
    }
    if (dto.priceCents !== undefined && dto.priceCents < 0) {
      throw new BadRequestException(
        'Price must be greater than or equal to zero',
      );
    }
    if (
      dto.termType === MembershipTermType.FIXED_TERM &&
      (dto.termMonths ?? existing.termMonths ?? 0) <= 0
    ) {
      throw new BadRequestException(
        'Fixed-term plans require a termMonths value',
      );
    }

    const scopeType = dto.scopeType ?? existing.scopeType;
    const locationIds =
      scopeType === MembershipScopeType.SPECIFIC_LOCATIONS
        ? (dto.locationIds ??
          existing.locations?.map((loc) => loc.locationId) ??
          [])
        : [];

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.membershipPlan.update({
        where: { id: planId },
        data: this.buildUpdateData(existing, dto),
        include: { locations: true },
      });

      if (scopeType === MembershipScopeType.SPECIFIC_LOCATIONS) {
        await tx.membershipPlanLocation.deleteMany({
          where: { membershipPlanId: planId },
        });
        if (locationIds.length > 0) {
          await tx.membershipPlanLocation.createMany({
            data: locationIds.map((locationId) => ({
              membershipPlanId: planId,
              locationId,
            })),
          });
        }
      } else {
        await tx.membershipPlanLocation.deleteMany({
          where: { membershipPlanId: planId },
        });
      }

      return plan;
    });
  }

  async deletePlan(organizationId: string, planId: string) {
    const existing = await this.prisma.membershipPlan.findFirst({
      where: { id: planId, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Membership plan not found');
    }

    await this.prisma.membershipPlanLocation.deleteMany({
      where: { membershipPlanId: planId },
    });

    return this.prisma.membershipPlan.delete({
      where: { id: planId },
    });
  }

  private validateCreatePayload(dto: CreateMembershipPlanDto) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Plan name is required');
    }
    if (dto.priceCents == null || dto.priceCents < 0) {
      throw new BadRequestException(
        'Price must be greater than or equal to zero',
      );
    }
    if (
      dto.termType === MembershipTermType.FIXED_TERM &&
      (dto.termMonths ?? 0) <= 0
    ) {
      throw new BadRequestException(
        'Fixed-term plans require a termMonths value',
      );
    }
    if (dto.hasIntroPeriod) {
      if ((dto.introMonths ?? 0) <= 0) {
        throw new BadRequestException(
          'Introductory period requires introMonths',
        );
      }
      if ((dto.introPriceCents ?? 0) < 0) {
        throw new BadRequestException('Introductory price must be >= 0');
      }
    }
    if (
      (dto.scopeType ?? MembershipScopeType.ORG_WIDE) ===
        MembershipScopeType.SPECIFIC_LOCATIONS &&
      (!dto.locationIds || dto.locationIds.length === 0)
    ) {
      throw new BadRequestException(
        'Location-scoped plans must include at least one locationId',
      );
    }
  }

  private buildCreateData(
    organizationId: string,
    dto: CreateMembershipPlanDto,
  ): Prisma.MembershipPlanUncheckedCreateInput {
    const scopeType = dto.scopeType ?? MembershipScopeType.ORG_WIDE;
    const allowsFamily = dto.allowsFamilyMembership ?? false;
    const hasIntro = dto.hasIntroPeriod ?? false;
    const termType = dto.termType;

    return {
      organizationId,
      name: dto.name.trim(),
      description: dto.description ?? null,
      cadence: dto.cadence,
      priceCents: dto.priceCents,
      currency: dto.currency ?? 'USD',
      termType,
      termMonths:
        termType === MembershipTermType.FIXED_TERM
          ? (dto.termMonths ?? null)
          : null,
      hasIntroPeriod: hasIntro,
      introMonths: hasIntro ? (dto.introMonths ?? null) : null,
      introPriceCents: hasIntro ? (dto.introPriceCents ?? null) : null,
      scopeType,
      allowsFamilyMembership: allowsFamily,
      maxFamilySize: allowsFamily ? (dto.maxFamilySize ?? null) : null,
      isActive: dto.isActive ?? true,
    };
  }

  private buildUpdateData(
    existing: Prisma.MembershipPlanGetPayload<{ include: { locations: true } }>,
    dto: UpdateMembershipPlanDto,
  ): Prisma.MembershipPlanUncheckedUpdateInput {
    const termType = dto.termType ?? existing.termType;
    const hasIntro = dto.hasIntroPeriod ?? existing.hasIntroPeriod;
    const allowsFamily =
      dto.allowsFamilyMembership ?? existing.allowsFamilyMembership;

    return {
      name: dto.name?.trim() ?? existing.name,
      description:
        dto.description !== undefined ? dto.description : existing.description,
      cadence: dto.cadence ?? existing.cadence,
      priceCents: dto.priceCents ?? existing.priceCents,
      currency: dto.currency ?? existing.currency,
      termType,
      termMonths:
        termType === MembershipTermType.FIXED_TERM
          ? (dto.termMonths ?? existing.termMonths ?? null)
          : null,
      hasIntroPeriod: hasIntro,
      introMonths: hasIntro
        ? (dto.introMonths ?? existing.introMonths ?? null)
        : null,
      introPriceCents: hasIntro
        ? (dto.introPriceCents ?? existing.introPriceCents ?? null)
        : null,
      scopeType: dto.scopeType ?? existing.scopeType,
      allowsFamilyMembership: allowsFamily,
      maxFamilySize: allowsFamily
        ? (dto.maxFamilySize ?? existing.maxFamilySize ?? null)
        : null,
      isActive: dto.isActive ?? existing.isActive,
    };
  }
}
