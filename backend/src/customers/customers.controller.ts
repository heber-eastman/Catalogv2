import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomerStatus } from '@prisma/client';
import {
  CreateCustomerDto,
  CustomersService,
  ListCustomersOptions,
  UpdateCustomerDto,
} from './customers.service';
import { AuthGuard } from '../auth/auth.guard';
import { OrganizationsGuard } from '../organizations/organizations.guard';
import {
  HouseholdsService,
  HouseholdMemberPayload,
} from './households.service';
import {
  AssignMembershipDto,
  MembershipsService,
  UpdateMembershipDto,
} from './memberships.service';
import { InteractionsService, LogInteractionDto } from './interactions.service';
import { CommsService, SendEmailDto, SendSmsDto } from './comms.service';
import { BillingService } from './billing.service';
import {
  FilesService,
  CreateUploadUrlDto,
  ConfirmUploadDto,
} from './files.service';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly householdsService: HouseholdsService,
    private readonly membershipsService: MembershipsService,
    private readonly interactionsService: InteractionsService,
    private readonly commsService: CommsService,
    private readonly billingService: BillingService,
    private readonly filesService: FilesService,
  ) {}

  private getOrganizationId(req: Request): string {
    const orgId = req.organization?.id;
    if (!orgId) {
      throw new UnauthorizedException('Organization context missing');
    }
    return orgId;
  }

  private getUserId(req: Request): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User context missing');
    }
    return userId;
  }

  @Get()
  list(
    @Req() req: Request,
    @Query() query: Record<string, string | undefined>,
  ) {
    const options: ListCustomersOptions = {
      search: query.search,
      locationId: query.locationId,
    };

    if (query.status || query.statuses) {
      const rawStatuses = (query.status ?? query.statuses ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => value.toUpperCase());

      const parsedStatuses = rawStatuses.filter(
        (value): value is CustomerStatus =>
          Object.values(CustomerStatus).includes(value as CustomerStatus),
      );

      if (parsedStatuses.length) {
        options.statuses = parsedStatuses;
      }
    }

    if (typeof query.hasMembership === 'string') {
      options.hasMembership =
        query.hasMembership.toLowerCase() === 'true'
          ? true
          : query.hasMembership.toLowerCase() === 'false'
            ? false
            : undefined;
    }

    if (query.locations) {
      options.locationIds = query.locations
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    }

    if (query.membershipPlanIds) {
      options.membershipPlanIds = query.membershipPlanIds
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    }

    if (query.tags) {
      options.tags = query.tags
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    }

    return this.customersService.listCustomers(
      this.getOrganizationId(req),
      options,
    );
  }

  @Get(':id')
  getById(@Req() req: Request, @Param('id') id: string) {
    return this.customersService.getCustomerById(
      this.getOrganizationId(req),
      id,
    );
  }

  @Get(':id/summary')
  async getSummary(@Req() req: Request, @Param('id') id: string) {
    const organizationId = this.getOrganizationId(req);
    const customer = await this.customersService.getCustomerById(
      organizationId,
      id,
    );

    const [household, membership, billingEvents, files, interactions] =
      await Promise.all([
        this.householdsService.getHouseholdForCustomer(organizationId, id),
        this.membershipsService.getMembershipForHead(organizationId, id),
        this.billingService.listBillingEvents(organizationId, id),
        this.filesService.listFiles(organizationId, id),
        this.interactionsService.listInteractions(organizationId, id),
      ]);

    return {
      customer,
      household,
      membership,
      billingEvents,
      files,
      interactions,
    };
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateCustomerDto) {
    return this.customersService.createCustomer(
      this.getOrganizationId(req),
      body,
    );
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(
      this.getOrganizationId(req),
      id,
      body,
    );
  }

  @Get(':id/household')
  getHousehold(@Req() req: Request, @Param('id') id: string) {
    return this.householdsService.getHouseholdForCustomer(
      this.getOrganizationId(req),
      id,
    );
  }

  @Post(':id/household')
  createHousehold(@Req() req: Request, @Param('id') id: string) {
    return this.householdsService.createHousehold(
      this.getOrganizationId(req),
      id,
    );
  }

  @Post(':id/household/members')
  addHouseholdMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: HouseholdMemberPayload,
  ) {
    return this.householdsService.addMember(
      this.getOrganizationId(req),
      id,
      body,
    );
  }

  @Delete(':id/household/members/:memberId')
  removeHouseholdMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.householdsService.removeMember(
      this.getOrganizationId(req),
      id,
      memberId,
    );
  }

  @Get(':id/membership')
  getMembership(@Req() req: Request, @Param('id') id: string) {
    return this.membershipsService.getMembershipForHead(
      this.getOrganizationId(req),
      id,
    );
  }

  @Post(':id/membership')
  assignMembership(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: AssignMembershipDto,
  ) {
    return this.membershipsService.assignMembership(
      this.getOrganizationId(req),
      id,
      body,
    );
  }

  @Patch(':id/membership/:membershipId')
  updateMembership(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
    @Body() body: UpdateMembershipDto,
  ) {
    return this.membershipsService.updateMembership(
      this.getOrganizationId(req),
      id,
      membershipId,
      body,
    );
  }

  @Post(':id/interactions')
  createInteraction(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: LogInteractionDto,
  ) {
    return this.interactionsService.logInteraction(
      this.getOrganizationId(req),
      id,
      {
        ...body,
        createdByUserId: this.getUserId(req),
      },
    );
  }

  @Get(':id/billing-events')
  listBillingEvents(@Req() req: Request, @Param('id') id: string) {
    return this.billingService.listBillingEvents(
      this.getOrganizationId(req),
      id,
    );
  }

  @Post(':id/files/upload-url')
  createUploadUrl(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: CreateUploadUrlDto,
  ) {
    return this.filesService.createUploadUrl(
      this.getOrganizationId(req),
      id,
      body,
    );
  }

  @Post(':id/files/confirm')
  confirmFileUpload(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: ConfirmUploadDto,
  ) {
    return this.filesService.confirmUpload(
      this.getOrganizationId(req),
      id,
      body,
      this.getUserId(req),
    );
  }

  @Get(':id/files')
  listFiles(@Req() req: Request, @Param('id') id: string) {
    return this.filesService.listFiles(this.getOrganizationId(req), id);
  }

  @Post(':id/email')
  sendEmail(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: SendEmailDto,
  ) {
    return this.commsService.sendEmail(this.getOrganizationId(req), id, {
      ...body,
      createdByUserId: this.getUserId(req),
    });
  }

  @Post(':id/sms')
  sendSms(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: SendSmsDto,
  ) {
    return this.commsService.sendSms(this.getOrganizationId(req), id, {
      ...body,
      createdByUserId: this.getUserId(req),
    });
  }
}
