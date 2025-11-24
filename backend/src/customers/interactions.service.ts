import { Injectable } from '@nestjs/common';
import { InteractionChannel, InteractionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface LogInteractionDto {
  createdByUserId: string;
  interactionType: InteractionType;
  channel: InteractionChannel;
  title: string;
  body?: string | null;
  relatedEmailId?: string | null;
  relatedSmsId?: string | null;
}

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  logInteraction(
    organizationId: string,
    customerProfileId: string,
    dto: LogInteractionDto,
  ) {
    return this.prisma.interaction.create({
      data: {
        organizationId,
        customerProfileId,
        createdByUserId: dto.createdByUserId,
        interactionType: dto.interactionType,
        channel: dto.channel,
        title: dto.title,
        body: dto.body ?? '',
        relatedEmailId: dto.relatedEmailId ?? null,
        relatedSmsId: dto.relatedSmsId ?? null,
      },
    });
  }

  listInteractions(organizationId: string, customerProfileId: string) {
    return this.prisma.interaction.findMany({
      where: {
        organizationId,
        customerProfileId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdByUser: true,
        relatedEmail: true,
        relatedSms: true,
      },
    });
  }
}
