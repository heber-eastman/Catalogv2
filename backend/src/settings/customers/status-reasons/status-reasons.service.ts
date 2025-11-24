import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StatusReasonType } from '@prisma/client';

export interface CreateStatusReasonDto {
  type: StatusReasonType;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateStatusReasonDto = Partial<CreateStatusReasonDto>;

@Injectable()
export class StatusReasonsService {
  constructor(private readonly prisma: PrismaService) {}

  listReasons(organizationId: string, type?: StatusReasonType) {
    return this.prisma.statusReason.findMany({
      where: {
        organizationId,
        type,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createReason(organizationId: string, dto: CreateStatusReasonDto) {
    this.validate(dto);

    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.statusReason.count({
        where: { organizationId, type: dto.type },
      })) + 1;

    return this.prisma.statusReason.create({
      data: {
        organizationId,
        type: dto.type,
        label: dto.label.trim(),
        sortOrder,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateReason(
    organizationId: string,
    reasonId: string,
    dto: UpdateStatusReasonDto,
  ) {
    const existing = await this.prisma.statusReason.findFirst({
      where: { id: reasonId, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Status reason not found');
    }

    if (dto.label !== undefined && !dto.label.trim()) {
      throw new BadRequestException('Label is required');
    }

    return this.prisma.statusReason.update({
      where: { id: reasonId },
      data: {
        label: dto.label?.trim(),
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });
  }

  async deleteReason(organizationId: string, reasonId: string) {
    const existing = await this.prisma.statusReason.findFirst({
      where: { id: reasonId, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Status reason not found');
    }

    await this.prisma.statusReason.delete({
      where: { id: reasonId },
    });
  }

  private validate(dto: CreateStatusReasonDto) {
    if (!dto.label || !dto.label.trim()) {
      throw new BadRequestException('Reason label is required');
    }

    if (!dto.type) {
      throw new BadRequestException('Reason type is required');
    }
  }
}
