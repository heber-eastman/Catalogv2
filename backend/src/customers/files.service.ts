import { randomUUID } from 'node:crypto';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerFileCategory } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface CreateUploadUrlDto {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface ConfirmUploadDto {
  key: string;
  fileName: string;
  category: CustomerFileCategory;
  contentType: string;
  sizeBytes: number;
}

export const S3_CLIENT = 'S3_CLIENT';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
  ) {}

  private getBucket() {
    const bucket = this.configService.get<string>('S3_BUCKET_NAME');
    if (!bucket) {
      throw new InternalServerErrorException(
        'S3_BUCKET_NAME is not configured',
      );
    }
    return bucket;
  }

  private buildKey(
    organizationId: string,
    customerProfileId: string,
    fileName: string,
  ) {
    const safeName = fileName.replace(/\s+/g, '-');
    return `customers/${organizationId}/${customerProfileId}/${Date.now()}-${randomUUID()}-${safeName}`;
  }

  async createUploadUrl(
    organizationId: string,
    customerProfileId: string,
    dto: CreateUploadUrlDto,
  ) {
    const bucket = this.getBucket();
    const key = this.buildKey(organizationId, customerProfileId, dto.fileName);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: dto.contentType,
      ContentLength: dto.sizeBytes,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 10,
    });

    return {
      uploadUrl,
      key,
    };
  }

  confirmUpload(
    organizationId: string,
    customerProfileId: string,
    dto: ConfirmUploadDto,
    uploadedByUserId: string,
  ) {
    return this.prisma.customerFile.create({
      data: {
        organizationId,
        customerProfileId,
        fileName: dto.fileName,
        category: dto.category,
        s3Key: dto.key,
        contentType: dto.contentType,
        sizeBytes: dto.sizeBytes,
        uploadedByUserId,
      },
    });
  }

  listFiles(organizationId: string, customerProfileId: string) {
    return this.prisma.customerFile.findMany({
      where: {
        organizationId,
        customerProfileId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
  }
}
