import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('LocationsService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: LocationsService;

  beforeEach(() => {
    prisma = {
      location: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new LocationsService(prisma);
  });

  it('lists locations scoped by organization', async () => {
    prisma.location.findMany.mockResolvedValue([]);
    await service.listLocations('org_1');
    expect(prisma.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org_1' },
      }),
    );
  });

  it('creates a location with normalized code', async () => {
    prisma.location.create.mockResolvedValue({ id: 'loc_1' } as any);
    await service.createLocation('org_1', {
      name: 'North Club',
      code: 'north',
    });

    expect(prisma.location.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          code: 'NORTH',
        }),
      }),
    );
  });

  it('throws when name or code missing', async () => {
    await expect(
      service.createLocation('org_1', { name: '', code: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('ensures location belongs to organization before update', async () => {
    prisma.location.findFirst.mockResolvedValue({
      id: 'loc_1',
      organizationId: 'org_1',
    } as any);
    prisma.location.update.mockResolvedValue({} as any);

    await service.updateLocation('org_1', 'loc_1', {
      name: 'Updated',
      code: 'updated',
    });

    expect(prisma.location.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'loc_1', organizationId: 'org_1' },
      }),
    );
    expect(prisma.location.update).toHaveBeenCalled();
  });

  it('throws when updating a location from another organization', async () => {
    prisma.location.findFirst.mockResolvedValue(null);

    await expect(
      service.updateLocation('org_1', 'loc_2', { name: 'Test', code: 'TEST' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
