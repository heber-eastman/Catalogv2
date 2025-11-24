import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildCorsOriginMatcher(rawOrigins: string[]) {
  const normalized = rawOrigins
    .map((origin) => origin.trim().toLowerCase())
    .filter((origin) => origin.length > 0);

  if (normalized.length === 0) {
    return (
      _origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, true);
    };
  }

  const testers = normalized.map((allowedOrigin) => {
    if (allowedOrigin === '*') {
      return () => true;
    }

    if (!allowedOrigin.includes('*')) {
      return (value?: string) => (value?.toLowerCase() ?? '') === allowedOrigin;
    }

    const pattern = allowedOrigin
      .split('*')
      .map((segment) => escapeForRegex(segment))
      .join('.*');
    const regex = new RegExp(`^${pattern}$`);

    return (value?: string) =>
      value ? regex.test(value.toLowerCase()) : false;
  });

  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = testers.some((tester) => tester(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(
        `[cors] blocked origin ${origin}. Allowed origins: ${normalized.join(', ')}`,
      );
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    }
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  const corsOrigins =
    configService.get<string>('CORS_ORIGINS') ??
    [
      'http://localhost:5173',
      'http://localhost:*',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:*',
      'http://catalog.localhost:5173',
      'http://*.catalog.localhost:5173',
    ].join(',');

  app.enableCors({
    origin: buildCorsOriginMatcher(corsOrigins.split(',')),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Catalog-Organization',
      'Accept',
    ],
  });

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
}
void bootstrap();
