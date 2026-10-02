import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { afterAll, beforeAll } from 'vitest';
import { PrismaClient } from '../src/infra/database/prisma/config/generated/client';

config({ path: '.env' });
config({ path: '.env.test', override: true });

const schema = `test_${randomUUID().replaceAll('-', '')}`;
let prisma: PrismaClient | undefined;

beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for E2E tests');
  }

  const url = new URL(connectionString);
  url.searchParams.set('schema', schema);
  const testDatabaseUrl = url.toString();

  process.env.DATABASE_URL = testDatabaseUrl;

  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: testDatabaseUrl }, { schema }),
  });

  execFileSync(
    'pnpm',
    ['exec', 'prisma', 'migrate', 'deploy', '--config', 'prisma7.config.ts'],
    { env: process.env, stdio: 'inherit' },
  );
});

afterAll(async () => {
  if (!prisma) return;

  try {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  } finally {
    await prisma.$disconnect();
  }
});
