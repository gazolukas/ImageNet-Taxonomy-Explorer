-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_path_key" ON "Taxonomy"("path");

-- CreateIndex
CREATE INDEX "Taxonomy_name_idx" ON "Taxonomy"("name");

-- CreateIndex
CREATE INDEX "Taxonomy_depth_idx" ON "Taxonomy"("depth");
