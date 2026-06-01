-- AlterTable: add pin + custom-order columns (defaults match the Prisma schema).
ALTER TABLE "Note" ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Note" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill: give existing notes a stable per-user order based on recency
-- (most recently updated first => sortOrder 0). No data is lost.
UPDATE "Note" AS n
SET "sortOrder" = sub.rn
FROM (
  SELECT
    "id",
    (ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC) - 1) AS rn
  FROM "Note"
) AS sub
WHERE n."id" = sub."id";
