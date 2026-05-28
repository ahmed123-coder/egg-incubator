-- CreateTable
CREATE TABLE "incubators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Incubator 1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incubators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_logs" (
    "id" TEXT NOT NULL,
    "incubatorId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "heaterOn" BOOLEAN NOT NULL,
    "fanOn" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incubation_sessions" (
    "id" TEXT NOT NULL,
    "incubatorId" TEXT NOT NULL,
    "name" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "incubation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "incubatorId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sensor_logs_incubatorId_createdAt_idx" ON "sensor_logs"("incubatorId", "createdAt");

-- CreateIndex
CREATE INDEX "incubation_sessions_incubatorId_isActive_idx" ON "incubation_sessions"("incubatorId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "settings_incubatorId_key_key" ON "settings"("incubatorId", "key");

-- AddForeignKey
ALTER TABLE "sensor_logs" ADD CONSTRAINT "sensor_logs_incubatorId_fkey" FOREIGN KEY ("incubatorId") REFERENCES "incubators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incubation_sessions" ADD CONSTRAINT "incubation_sessions_incubatorId_fkey" FOREIGN KEY ("incubatorId") REFERENCES "incubators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_incubatorId_fkey" FOREIGN KEY ("incubatorId") REFERENCES "incubators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
