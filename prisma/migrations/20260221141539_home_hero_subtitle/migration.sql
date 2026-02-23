-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HomeContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startQuoteDoc" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL DEFAULT 'For anyone trying to feel like themselves online.',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HomeContent" ("id", "startQuoteDoc", "updatedAt") SELECT "id", "startQuoteDoc", "updatedAt" FROM "HomeContent";
DROP TABLE "HomeContent";
ALTER TABLE "new_HomeContent" RENAME TO "HomeContent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
