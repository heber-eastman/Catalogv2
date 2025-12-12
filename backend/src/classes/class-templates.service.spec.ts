import { ClassTemplatesService } from './class-templates.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ClassTemplatesService', () => {
  const baseTemplate = {
    id: 'tmpl_1',
    organizationId: 'org_1',
    locationId: 'loc_1',
    room: 'Studio A',
    name: 'Functional Fitness',
    description: null,
    program: 'Fitness',
    skillLevel: 'BEGINNER' as const,
    tags: [],
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-03'),
    daysOfWeek: [3], // Wednesday
    startTime: '06:30',
    endTime: '07:30',
    maxParticipants: 18,
    accessType: 'EITHER' as const,
    dropInPriceCents: null,
    currency: null,
    minAge: null,
    maxAge: null,
    ageLabel: null,
    membersOnly: false,
    prerequisiteLabel: null,
    primaryInstructorUserId: 'user_1',
    instructorDisplayName: 'Coach Amy',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    classTemplate: {
      create: jest.fn().mockResolvedValue(baseTemplate),
    },
    classSession: {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      deleteMany: jest.fn(),
    },
  } as unknown as PrismaService;

  const service = new ClassTemplatesService(prisma);

  it('creates template and generates sessions in range', async () => {
    const template = await service.create(
      {
        ...baseTemplate,
        id: undefined as unknown as string,
        organizationId: undefined as unknown as string,
      },
      'org_1',
    );

    expect(prisma.classTemplate.create).toHaveBeenCalled();
    expect(prisma.classSession.createMany).toHaveBeenCalled();
    expect(template).toEqual(baseTemplate);
  });
});
