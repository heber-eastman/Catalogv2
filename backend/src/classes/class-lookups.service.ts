import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationRole } from '@prisma/client';

@Injectable()
export class ClassLookupsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLocations(organizationId: string) {
    return this.prisma.location.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  }

  async getInstructors(organizationId: string) {
    return this.prisma.organizationUser.findMany({
      where: { organizationId, role: OrganizationRole.ORG_STAFF },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getPrograms(organizationId: string) {
    const programs = await this.prisma.classTemplate.findMany({
      where: { organizationId, program: { not: null } },
      select: { program: true },
    });
    const unique = Array.from(
      new Set(programs.map((p) => p.program).filter((p): p is string => !!p)),
    );
    return unique.sort();
  }

  async getRooms(organizationId: string) {
    const rooms = await this.prisma.classTemplate.findMany({
      where: { organizationId, room: { not: null } },
      select: { room: true },
    });
    const unique = Array.from(
      new Set(rooms.map((r) => r.room).filter((r): r is string => !!r)),
    );
    return unique.sort();
  }
}
