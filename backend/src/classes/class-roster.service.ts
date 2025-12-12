import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ClassAttendanceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCustomerDto,
  CustomersService,
} from '../customers/customers.service';

export interface NewCustomerPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string | Date;
}

@Injectable()
export class ClassRosterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
  ) {}

  private async getSessionOrThrow(sessionId: string, organizationId: string) {
    const session = await this.prisma.classSession.findFirst({
      where: { id: sessionId, organizationId },
      select: { id: true, organizationId: true },
    });
    if (!session) {
      throw new NotFoundException('Class session not found');
    }
    return session;
  }

  private async ensureCustomerInOrg(
    customerProfileId: string,
    organizationId: string,
  ) {
    const customer = await this.prisma.customerProfile.findFirst({
      where: { id: customerProfileId, organizationId },
      select: { id: true },
    });
    if (!customer) {
      throw new ForbiddenException('Customer not in organization');
    }
    return customer;
  }

  async addExistingParticipant(
    sessionId: string,
    organizationId: string,
    customerProfileId: string,
    status: ClassAttendanceStatus = ClassAttendanceStatus.REGISTERED,
    actingUserId?: string,
  ) {
    await this.getSessionOrThrow(sessionId, organizationId);
    await this.ensureCustomerInOrg(customerProfileId, organizationId);

    return this.prisma.classSessionRosterEntry.create({
      data: {
        sessionId,
        customerProfileId,
        status,
        createdByUserId: actingUserId ?? null,
        updatedByUserId: actingUserId ?? null,
      },
    });
  }

  async addNewCustomerAndParticipant(
    sessionId: string,
    organizationId: string,
    newCustomer: NewCustomerPayload,
    actingUserId?: string,
  ) {
    await this.getSessionOrThrow(sessionId, organizationId);

    const customerDto: CreateCustomerDto = {
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      primaryEmail: newCustomer.email ?? null,
      primaryPhone: newCustomer.phone ?? null,
      dateOfBirth: newCustomer.dateOfBirth
        ? new Date(newCustomer.dateOfBirth)
        : null,
    };

    const customer = await this.customersService.createCustomer(
      organizationId,
      customerDto,
    );

    return this.addExistingParticipant(
      sessionId,
      organizationId,
      customer.id,
      ClassAttendanceStatus.REGISTERED,
      actingUserId,
    );
  }

  async updateParticipantStatus(
    sessionId: string,
    organizationId: string,
    rosterEntryId: string,
    status: ClassAttendanceStatus,
    note: string | null | undefined,
    actingUserId?: string,
  ) {
    await this.getSessionOrThrow(sessionId, organizationId);
    const entry = await this.prisma.classSessionRosterEntry.findFirst({
      where: { id: rosterEntryId, sessionId, session: { organizationId } },
    });
    if (!entry) {
      throw new NotFoundException('Roster entry not found');
    }

    return this.prisma.classSessionRosterEntry.update({
      where: { id: rosterEntryId },
      data: {
        status,
        note: note ?? entry.note,
        updatedByUserId: actingUserId ?? null,
      },
    });
  }

  async removeParticipant(
    sessionId: string,
    organizationId: string,
    rosterEntryId: string,
  ) {
    await this.getSessionOrThrow(sessionId, organizationId);
    const entry = await this.prisma.classSessionRosterEntry.findFirst({
      where: { id: rosterEntryId, sessionId, session: { organizationId } },
    });
    if (!entry) {
      throw new NotFoundException('Roster entry not found');
    }

    await this.prisma.classSessionRosterEntry.delete({
      where: { id: rosterEntryId },
    });

    return { success: true };
  }
}
