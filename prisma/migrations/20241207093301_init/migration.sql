-- AlterTable
ALTER TABLE "_LabelToTask" ADD CONSTRAINT "_LabelToTask_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LabelToTask_AB_unique";

-- AlterTable
ALTER TABLE "_favorites" ADD CONSTRAINT "_favorites_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_favorites_AB_unique";
