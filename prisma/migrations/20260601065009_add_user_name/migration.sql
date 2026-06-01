-- AlterTable
-- Add the required `name` column. Existing rows are backfilled with a
-- placeholder, then the default is dropped so new rows must provide a name
-- (matching the Prisma schema, which has no default).
ALTER TABLE "User" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'User';
ALTER TABLE "User" ALTER COLUMN "name" DROP DEFAULT;
