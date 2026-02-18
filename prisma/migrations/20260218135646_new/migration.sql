-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipAddress" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutExpiresAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "LoginAttempt_ipAddress_key" ON "LoginAttempt"("ipAddress");
