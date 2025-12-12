import { ClassRosterService } from './class-roster.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { ClassAttendanceStatus } from '@prisma/client';

describe('ClassRosterService', () => {
  const prisma = {
    classSession: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: 'session-1', organizationId: 'org-1' }),
    },
    customerProfile: {
      findFirst: jest.fn().mockResolvedValue({ id: 'cust-1' }),
    },
    classSessionRosterEntry: {
      create: jest.fn().mockResolvedValue({ id: 'roster-1' }),
      findFirst: jest.fn().mockResolvedValue({ id: 'roster-1', note: null }),
      update: jest.fn().mockResolvedValue({
        id: 'roster-1',
        status: ClassAttendanceStatus.ATTENDED,
      }),
      delete: jest.fn(),
    },
  } as unknown as PrismaService;

  const customersService = {
    createCustomer: jest.fn().mockResolvedValue({ id: 'cust-2' }),
  } as unknown as CustomersService;

  const service = new ClassRosterService(prisma, customersService);

  it('adds existing participant', async () => {
    const result = await service.addExistingParticipant(
      'session-1',
      'org-1',
      'cust-1',
      ClassAttendanceStatus.REGISTERED,
      'user-1',
    );
    expect(prisma.classSessionRosterEntry.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'roster-1' });
  });

  it('quick-creates customer and adds participant', async () => {
    await service.addNewCustomerAndParticipant('session-1', 'org-1', {
      firstName: 'New',
      lastName: 'Customer',
    });
    expect(customersService.createCustomer).toHaveBeenCalled();
    expect(prisma.classSessionRosterEntry.create).toHaveBeenCalled();
  });

  it('updates participant status', async () => {
    const result = await service.updateParticipantStatus(
      'session-1',
      'org-1',
      'roster-1',
      ClassAttendanceStatus.ATTENDED,
      'note',
      'user-1',
    );
    expect(result.status).toBe(ClassAttendanceStatus.ATTENDED);
  });

  it('removes participant', async () => {
    await service.removeParticipant('session-1', 'org-1', 'roster-1', 'user-1');
    expect(prisma.classSessionRosterEntry.delete).toHaveBeenCalled();
  });
});
