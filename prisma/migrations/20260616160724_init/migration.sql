-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "niche" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "backstory" TEXT NOT NULL,
    "monetizationLink" TEXT NOT NULL,
    "monetizationProduct" TEXT NOT NULL,
    "toneOfVoice" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "characterDna" TEXT NOT NULL,
    "audioSettings" TEXT NOT NULL,
    "videoSettings" TEXT NOT NULL,
    "avatarImage" TEXT,
    "gender" TEXT,
    "bodyType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PostIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "avatarId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "scenePrompt" TEXT NOT NULL,
    "formattedFlowPrompt" TEXT NOT NULL,
    "instagramCaption" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productImage" TEXT,
    "productName" TEXT,
    "promptStyle" TEXT,
    CONSTRAINT "PostIdea_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatSimulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "avatarId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userBio" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatSimulation_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ChatSimulation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountSetup" (
    "avatarId" TEXT NOT NULL PRIMARY KEY,
    "usernames" TEXT NOT NULL,
    "bios" TEXT NOT NULL,
    "gridPlan" TEXT NOT NULL,
    "seoTips" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccountSetup_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
