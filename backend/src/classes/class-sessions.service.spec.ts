import { ClassSessionsService } from './class-sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClassSessionStatus } from '@prisma/client';

describe('ClassSessionsService', () => {
  const prisma = {
    classSession: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const service = new ClassSessionsService(prisma);

  it('filters sessions in range', async () => {
    prisma.classSession.findMany = jest
      .fn()
      .mockResolvedValue([{ id: 'session-1' }]);
    const result = await service.findInRange({
      organizationId: 'org_1',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    });
    expect(prisma.classSession.findMany).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'session-1' }]);
  });

  it('updates session status and instructor', async () => {
    prisma.classSession.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 'session-1', cancelReason: null });
    prisma.classSession.update = jest.fn().mockResolvedValue({
      id: 'session-1',
      status: ClassSessionStatus.CANCELLED,
    });

    const updated = await service.updateSession('session-1', 'org_1', {
      status: ClassSessionStatus.CANCELLED,
      cancelReason: 'Weather',
      instructorUserId: 'user_2',
    });

    expect(prisma.classSession.update).toHaveBeenCalled();
    expect(updated.status).toBe(ClassSessionStatus.CANCELLED);
  });
});
