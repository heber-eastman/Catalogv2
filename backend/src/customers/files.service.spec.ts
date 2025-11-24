import { ConfigService } from '@nestjs/config';
import { CustomerFileCategory } from '@prisma/client';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3-upload-url'),
}));

describe('FilesService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let config: jest.Mocked<ConfigService>;
  let service: FilesService;
  let s3Client: jest.Mocked<S3Client>;

  beforeEach(() => {
    prisma = {
      customerFile: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    config = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'S3_BUCKET_NAME') return 'catalog-bucket';
        if (key === 'S3_REGION') return 'us-east-1';
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    s3Client = { send: jest.fn() } as unknown as jest.Mocked<S3Client>;

    service = new FilesService(prisma, config, s3Client);
  });

  it('generates upload url with scoped key and metadata', async () => {
    const result = await service.createUploadUrl('org_1', 'cust_1', {
      fileName: 'profile.pdf',
      contentType: 'application/pdf',
      sizeBytes: 2048,
    });

    expect(getSignedUrl).toHaveBeenCalled();
    expect(result.uploadUrl).toBe('https://s3-upload-url');
    expect(result.key).toContain('org_1');
    expect(result.key).toContain('cust_1');
  });

  it('persists customer file metadata on confirm', async () => {
    prisma.customerFile.create.mockResolvedValue({
      id: 'file_1',
    } as any);

    await service.confirmUpload(
      'org_1',
      'cust_1',
      {
        key: 'customers/org_1/cust_1/test.pdf',
        fileName: 'test.pdf',
        category: CustomerFileCategory.WAIVER,
        contentType: 'application/pdf',
        sizeBytes: 4096,
      },
      'user_1',
    );

    expect(prisma.customerFile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org_1',
          customerProfileId: 'cust_1',
          fileName: 'test.pdf',
          s3Key: 'customers/org_1/cust_1/test.pdf',
        }),
      }),
    );
  });

  it('lists files for the customer scoped by org', async () => {
    prisma.customerFile.findMany.mockResolvedValue([]);

    await service.listFiles('org_1', 'cust_1');

    expect(prisma.customerFile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 'org_1',
          customerProfileId: 'cust_1',
        },
        orderBy: {
          uploadedAt: 'desc',
        },
      }),
    );
  });
});
