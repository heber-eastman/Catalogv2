import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassTemplate, Prisma, ClassSession } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface FindTemplatesParams {
  organizationId: string;
  locationId?: string;
  program?: string;
  instructorUserId?: string;
  isActive?: boolean;
}

export type CreateClassTemplateDto = Omit<
  Prisma.ClassTemplateUncheckedCreateInput,
  'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'sessions'
>;

export type UpdateClassTemplateDto = Partial<CreateClassTemplateDto>;

@Injectable()
export class ClassTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindTemplatesParams) {
    const where: Prisma.ClassTemplateWhereInput = {
      organizationId: params.organizationId,
    };

    if (params.locationId) {
      where.locationId = params.locationId;
    }
    if (params.program) {
      where.program = params.program;
    }
    if (params.instructorUserId) {
      where.primaryInstructorUserId = params.instructorUserId;
    }
    if (typeof params.isActive === 'boolean') {
      where.isActive = params.isActive;
    }

    return this.prisma.classTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        requiredPlans: {
          include: { membershipPlan: true },
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const template = await this.prisma.classTemplate.findFirst({
      where: { id, organizationId },
      include: {
        requiredPlans: { include: { membershipPlan: true } },
      },
    });
    if (!template) {
      throw new NotFoundException('Class template not found');
    }
    return template;
  }

  async create(
    data: CreateClassTemplateDto,
    organizationId: string,
  ): Promise<ClassTemplate> {
    const template = await this.prisma.classTemplate.create({
      data: {
        ...data,
        organizationId,
      },
    });

    await this.generateSessionsForTemplate(template);
    return template;
  }

  async update(
    id: string,
    data: UpdateClassTemplateDto,
    organizationId: string,
  ): Promise<ClassTemplate> {
    await this.findOne(id, organizationId);

    const updated = await this.prisma.classTemplate.update({
      where: { id },
      data,
    });

    // Regenerate future sessions without roster entries; keep past/attended intact
    const today = new Date();
    await this.prisma.classSession.deleteMany({
      where: {
        templateId: id,
        organizationId,
        startDateTime: { gte: today },
        rosterEntries: { none: {} },
      },
    });

    await this.generateSessionsForTemplate(updated, today);

    return updated;
  }

  private async generateSessionsForTemplate(
    template: ClassTemplate,
    fromDate?: Date,
  ): Promise<ClassSession[]> {
    const startDate = new Date(
      fromDate && fromDate > template.startDate ? fromDate : template.startDate,
    );
    const endDate = template.endDate ? new Date(template.endDate) : undefined;
    const daysOfWeek = template.daysOfWeek ?? [];

    const sessions: Prisma.ClassSessionUncheckedCreateInput[] = [];

    const cursor = new Date(startDate);
    while (!endDate || cursor <= endDate) {
      const isoDay = this.getIsoDay(cursor);
      if (daysOfWeek.includes(isoDay)) {
        const startDateTime = this.combineDateAndTime(
          cursor,
          template.startTime,
        );
        const endDateTime = this.combineDateAndTime(cursor, template.endTime);

        sessions.push({
          templateId: template.id,
          organizationId: template.organizationId,
          locationId: template.locationId,
          room: template.room,
          startDateTime,
          endDateTime,
          maxParticipants: template.maxParticipants,
          instructorUserId: template.primaryInstructorUserId,
          instructorDisplayName: template.instructorDisplayName,
          status: 'SCHEDULED',
          cancelReason: null,
        });
      }

      cursor.setDate(cursor.getDate() + 1);
      if (endDate && cursor > endDate) {
        break;
      }
    }

    if (!sessions.length) {
      return [];
    }

    return this.prisma.classSession.createMany({
      data: sessions,
    }) as unknown as Promise<ClassSession[]>;
  }

  private getIsoDay(date: Date): number {
    const day = date.getDay(); // 0 (Sun) - 6 (Sat)
    return day === 0 ? 7 : day;
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr ?? '0', 10);
    const minutes = parseInt(minutesStr ?? '0', 10);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }
}
