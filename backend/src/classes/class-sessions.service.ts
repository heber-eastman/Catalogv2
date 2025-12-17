import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassSession, ClassSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface FindSessionsParams {
  organizationId: string;
  startDate: Date;
  endDate: Date;
  locationId?: string;
  program?: string;
  instructorUserId?: string;
  room?: string;
  status?: ClassSessionStatus;
}

export interface UpdateSessionDto {
  status?: ClassSessionStatus;
  cancelReason?: string | null;
  instructorUserId?: string | null;
  instructorDisplayName?: string | null;
}

@Injectable()
export class ClassSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findInRange(params: FindSessionsParams) {
    const where: Prisma.ClassSessionWhereInput = {
      organizationId: params.organizationId,
      startDateTime: { gte: params.startDate },
      endDateTime: { lte: params.endDate },
    };

    if (params.locationId) {
      where.locationId = params.locationId;
    }

    if (params.instructorUserId) {
      where.OR = [
        { instructorUserId: params.instructorUserId },
        {
          template: { primaryInstructorUserId: params.instructorUserId },
        },
      ];
    }

    if (params.program) {
      where.template = { program: params.program };
    }

    if (params.room) {
      where.room = params.room;
    }

    if (params.status) {
      where.status = params.status;
    }

    return this.prisma.classSession.findMany({
      where,
      orderBy: { startDateTime: 'asc' },
      include: {
        location: {
          select: { id: true, name: true },
        },
        template: {
          select: {
            id: true,
            name: true,
            program: true,
            skillLevel: true,
            accessType: true,
          },
        },
        instructor: {
          select: { id: true, name: true },
        },
        _count: {
          select: { rosterEntries: true },
        },
      },
    });
  }

  async findOneWithRoster(id: string, organizationId: string) {
    const session = await this.prisma.classSession.findFirst({
      where: { id, organizationId },
      include: {
        location: { select: { id: true, name: true } },
        template: {
          select: {
            id: true,
            name: true,
            program: true,
            skillLevel: true,
            accessType: true,
            minAge: true,
            maxAge: true,
            ageLabel: true,
            membersOnly: true,
            prerequisiteLabel: true,
            requiredPlans: {
              include: { membershipPlan: true },
            },
          },
        },
        rosterEntries: {
          include: {
            customerProfile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                primaryEmail: true,
                primaryPhone: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Class session not found');
    }

    return session;
  }

  async updateSession(
    id: string,
    organizationId: string,
    dto: UpdateSessionDto,
  ): Promise<ClassSession> {
    const existing = await this.prisma.classSession.findFirst({
      where: { id, organizationId },
    });
    if (!existing) {
      throw new NotFoundException('Class session not found');
    }

    // use unchecked update to allow direct scalar assignment of FK fields
    const data: Prisma.ClassSessionUncheckedUpdateInput = {};
    if (dto.status) {
      data.status = dto.status;
      if (dto.status === ClassSessionStatus.CANCELLED) {
        data.cancelReason = dto.cancelReason ?? existing.cancelReason ?? '';
      }
    }

    if (dto.instructorUserId !== undefined) {
      data.instructorUserId = dto.instructorUserId;
    }
    if (dto.instructorDisplayName !== undefined) {
      data.instructorDisplayName = dto.instructorDisplayName;
    }

    return this.prisma.classSession.update({
      where: { id },
      data,
    });
  }
}
