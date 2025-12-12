import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { OrganizationsGuard } from '../organizations/organizations.guard';
import {
  ClassTemplatesService,
  CreateClassTemplateDto,
  FindTemplatesParams,
  UpdateClassTemplateDto,
} from './class-templates.service';

@UseGuards(AuthGuard, OrganizationsGuard)
@Controller('api/classes/templates')
export class ClassTemplatesController {
  constructor(private readonly templatesService: ClassTemplatesService) {}

  private getOrganizationId(req: Request): string {
    return req.organization?.id as string;
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: Record<string, string>) {
    const organizationId = this.getOrganizationId(req);
    const params: FindTemplatesParams = {
      organizationId,
    };

    if (query.locationId) params.locationId = query.locationId;
    if (query.program) params.program = query.program;
    if (query.instructorUserId)
      params.instructorUserId = query.instructorUserId;
    if (typeof query.isActive === 'string') {
      params.isActive = query.isActive === 'true';
    }

    return this.templatesService.findAll(params);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const organizationId = this.getOrganizationId(req);
    return this.templatesService.findOne(id, organizationId);
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateClassTemplateDto) {
    const organizationId = this.getOrganizationId(req);
    return this.templatesService.create(body, organizationId);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateClassTemplateDto,
  ) {
    const organizationId = this.getOrganizationId(req);
    return this.templatesService.update(id, body, organizationId);
  }
}
