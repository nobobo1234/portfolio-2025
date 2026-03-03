-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "demoUrl" TEXT NOT NULL,
    "githubUrl" TEXT,
    "bannerImgUrl" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Project" ("bannerImgUrl", "client", "content", "createdAt", "demoUrl", "githubUrl", "id", "services", "slug", "subtitle", "technology", "title", "updatedAt", "year") SELECT "bannerImgUrl", "client", "content", "createdAt", "demoUrl", "githubUrl", "id", "services", "slug", "subtitle", "technology", "title", "updatedAt", "year" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
