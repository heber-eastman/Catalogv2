import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CreateLocationDto {
  name: string;
  code: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  listLocations(organizationId: string) {
    return this.prisma.location.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async createLocation(organizationId: string, dto: CreateLocationDto) {
    this.validate(dto);

    return this.prisma.location.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        code: dto.code.trim().toUpperCase(),
        addressLine1: dto.addressLine1 ?? null,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        postalCode: dto.postalCode ?? null,
        country: dto.country ?? null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateLocation(
    organizationId: string,
    locationId: string,
    dto: UpdateLocationDto,
  ) {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new BadRequestException('Location name is required');
    }

    if (dto.code !== undefined && !dto.code.trim()) {
      throw new BadRequestException('Location code is required');
    }

    const existing = await this.prisma.location.findFirst({
      where: { id: locationId, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Location not found');
    }

    return this.prisma.location.update({
      where: { id: locationId },
      data: {
        name: dto.name?.trim(),
        code: dto.code ? dto.code.trim().toUpperCase() : undefined,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        isActive: dto.isActive,
      },
    });
  }

  async deleteLocation(organizationId: string, locationId: string) {
    const existing = await this.prisma.location.findFirst({
      where: { id: locationId, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Location not found');
    }

    await this.prisma.location.delete({
      where: { id: locationId },
    });
  }

  private validate(dto: Partial<CreateLocationDto>) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Location name is required');
    }

    if (!dto.code || !dto.code.trim()) {
      throw new BadRequestException('Location code is required');
    }
  }
}
