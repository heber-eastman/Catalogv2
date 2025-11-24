import {
  EmailStatus,
  InteractionChannel,
  InteractionType,
  SmsStatus,
} from '@prisma/client';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';
import { InteractionsService } from './interactions.service';

export interface SendEmailDto {
  createdByUserId: string;
  to: string;
  subject: string;
  body: string;
  templateName?: string;
}

export interface SendSmsDto {
  createdByUserId: string;
  to: string;
  body: string;
  templateName?: string;
}

@Injectable()
export class CommsService {
  private readonly resend: Resend | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly interactionsService: InteractionsService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  private ensureFromEmail() {
    const from = this.configService.get<string>('RESEND_FROM_EMAIL');
    if (!from) {
      throw new InternalServerErrorException(
        'RESEND_FROM_EMAIL configuration missing',
      );
    }
    return from;
  }

  async sendEmail(
    organizationId: string,
    customerProfileId: string,
    dto: SendEmailDto,
  ) {
    const from = this.ensureFromEmail();

    let providerMessageId: string | undefined;

    if (this.resend) {
      const response = await this.resend.emails.send({
        from,
        to: dto.to,
        subject: dto.subject,
        html: dto.body,
      });

      if ('error' in response && response.error) {
        throw new InternalServerErrorException(
          response.error.message ?? 'Failed to send email via Resend',
        );
      }

      providerMessageId =
        'data' in response ? (response.data?.id ?? undefined) : undefined;
    }

    const emailMessage = await this.prisma.emailMessage.create({
      data: {
        organizationId,
        customerProfileId,
        templateName: dto.templateName,
        subject: dto.subject,
        body: dto.body,
        status: EmailStatus.SENT,
        providerMessageId,
        createdByUserId: dto.createdByUserId,
        createdAt: new Date(),
        sentAt: new Date(),
      },
    });

    await this.interactionsService.logInteraction(
      organizationId,
      customerProfileId,
      {
        createdByUserId: dto.createdByUserId,
        interactionType: InteractionType.EMAIL,
        channel: InteractionChannel.EMAIL,
        title: dto.subject,
        body: dto.body,
        relatedEmailId: emailMessage.id,
      },
    );

    return emailMessage;
  }

  async sendSms(
    organizationId: string,
    customerProfileId: string,
    dto: SendSmsDto,
  ) {
    const smsMessage = await this.prisma.smsMessage.create({
      data: {
        organizationId,
        customerProfileId,
        templateName: dto.templateName,
        body: dto.body,
        status: SmsStatus.STUB_SENT,
        createdByUserId: dto.createdByUserId,
      },
    });

    await this.interactionsService.logInteraction(
      organizationId,
      customerProfileId,
      {
        createdByUserId: dto.createdByUserId,
        interactionType: InteractionType.SMS,
        channel: InteractionChannel.SMS,
        title: 'SMS sent',
        body: dto.body,
        relatedSmsId: smsMessage.id,
      },
    );

    return smsMessage;
  }
}
