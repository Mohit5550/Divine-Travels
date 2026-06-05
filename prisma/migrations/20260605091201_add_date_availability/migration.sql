-- CreateTable
CREATE TABLE "DateAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "subOptions" TEXT NOT NULL DEFAULT '[]',
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DateAvailability_date_service_key" ON "DateAvailability"("date", "service");
