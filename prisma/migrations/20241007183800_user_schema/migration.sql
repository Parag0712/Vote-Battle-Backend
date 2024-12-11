-- CreateTable
CREATE TABLE "Clash" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClashItem" (
    "id" SERIAL NOT NULL,
    "clash_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClashItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClashComments" (
    "id" SERIAL NOT NULL,
    "clash_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClashComments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Clash_expire_at_title_idx" ON "Clash"("expire_at", "title");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- AddForeignKey
ALTER TABLE "Clash" ADD CONSTRAINT "Clash_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClashItem" ADD CONSTRAINT "ClashItem_clash_id_fkey" FOREIGN KEY ("clash_id") REFERENCES "Clash"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClashComments" ADD CONSTRAINT "ClashComments_clash_id_fkey" FOREIGN KEY ("clash_id") REFERENCES "Clash"("id") ON DELETE CASCADE ON UPDATE CASCADE;
