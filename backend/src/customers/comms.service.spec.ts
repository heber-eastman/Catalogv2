import { InteractionChannel, InteractionType, SmsStatus } from '@prisma/client';
import { CommsService } from './comms.service';
import { PrismaService } from '../prisma/prisma.service';
import { InteractionsService } from './interactions.service';
import { ConfigService } from '@nestjs/config';

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({
          id: 'email_123',
        }),
      },
    })),
  };
});

describe('CommsService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let interactionsService: jest.Mocked<InteractionsService>;
  let config: jest.Mocked<ConfigService>;
  let service: CommsService;

  beforeEach(() => {
    prisma = {
      emailMessage: {
        create: jest.fn(),
      },
      smsMessage: {
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    interactionsService = {
      logInteraction: jest.fn(),
    } as unknown as jest.Mocked<InteractionsService>;

    config = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'RESEND_API_KEY') return 'resend_test_key';
        if (key === 'RESEND_FROM_EMAIL') return 'Catalog <hello@catalog.app>';
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    service = new CommsService(prisma, config, interactionsService);
  });

  it('sends email via Resend, stores record, and logs interaction', async () => {
    prisma.emailMessage.create.mockResolvedValue({
      id: 'email_msg_1',
    } as any);

    await service.sendEmail('org_1', 'cust_1', {
      createdByUserId: 'user_1',
      subject: 'Welcome',
      body: 'Thanks for joining',
      to: 'member@example.com',
      templateName: 'welcome',
    });

    expect(prisma.emailMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          customerProfileId: 'cust_1',
          subject: 'Welcome',
        }),
      }),
    );

    expect(interactionsService.logInteraction).toHaveBeenCalledWith(
      'org_1',
      'cust_1',
      expect.objectContaining({
        interactionType: InteractionType.EMAIL,
        channel: InteractionChannel.EMAIL,
        relatedEmailId: 'email_msg_1',
      }),
    );
  });

  it('creates sms message record and logs automation interaction', async () => {
    prisma.smsMessage.create.mockResolvedValue({
      id: 'sms_msg_1',
    } as any);

    await service.sendSms('org_1', 'cust_1', {
      createdByUserId: 'user_1',
      body: 'Test SMS',
      to: '+15555555555',
    });

    expect(prisma.smsMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          customerProfileId: 'cust_1',
          status: SmsStatus.STUB_SENT,
        }),
      }),
    );

    expect(interactionsService.logInteraction).toHaveBeenCalledWith(
      'org_1',
      'cust_1',
      expect.objectContaining({
        interactionType: InteractionType.SMS,
        channel: InteractionChannel.SMS,
        relatedSmsId: 'sms_msg_1',
      }),
    );
  });
});
