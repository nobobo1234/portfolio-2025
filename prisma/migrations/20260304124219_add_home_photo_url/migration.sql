-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HomeContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startQuoteDoc" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL DEFAULT 'For anyone trying to feel like themselves online.',
    "aboutSection" TEXT NOT NULL DEFAULT 'I make and design websites for people like you. Not just single pages, but spaces that reflect your personality. Good websites should feel like a second language you already spoke, not something that screams. I''ve been coding websites since I was 11. Mostly out of curiosity, but honestly, because I''ve always been a little obsessed. That part hasn''t really changed.',
    "photoUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HomeContent" ("aboutSection", "heroSubtitle", "id", "startQuoteDoc", "updatedAt") SELECT "aboutSection", "heroSubtitle", "id", "startQuoteDoc", "updatedAt" FROM "HomeContent";
DROP TABLE "HomeContent";
ALTER TABLE "new_HomeContent" RENAME TO "HomeContent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
