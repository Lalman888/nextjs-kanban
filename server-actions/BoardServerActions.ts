"use server";
import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
import { revalidatePath } from "next/cache";
import { CreateBoardSchema, EditBoardSchema } from "@/types/zodTypes";
import { BoardCreationData, BoardEditData } from "@/types/types";
import { ActivityType } from "@prisma/client";

enum LabelColor {
  GREEN = "green",
  YELLOW = "yellow",
  ORANGE = "orange",
  RED = "red",
  PURPLE = "purple",
  BLUE = "blue",
}

const DEFAULT_LABEL_COLORS: LabelColor[] = [
  LabelColor.GREEN,
  LabelColor.YELLOW,
  LabelColor.ORANGE,
  LabelColor.RED,
  LabelColor.PURPLE,
  LabelColor.BLUE,
];

export async function handleCreateBoard(data: BoardCreationData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const parse = CreateBoardSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: "Failed to create board due to validation error",
    };
  }

  try {
    // Create the board
    const createdBoard = await prisma.board.create({
      data: {
        title: parse.data.title,
      },
    });

    await prisma.boardMember.create({
      data: {
        boardId: createdBoard.id,
        userId: session.user.id,
        role: "owner",
      },
    });

    await createDefaultLabelsForBoard(createdBoard.id, session.user.id);

    revalidatePath("/board/");

    return {
      success: true,
      message: "Board Created",
      boardId: createdBoard.id,
    };
  } catch (e) {
    return { success: false, message: "Failed to create board" };
  }
}

// Function to create default labels for a board
async function createDefaultLabelsForBoard(boardId: string, userId: string) {
  const labelCreations = DEFAULT_LABEL_COLORS.map((color) => {
    return prisma.label.create({
      data: {
        color: color,
        title: null,
        boardId: boardId,
        isDefault: true,
        userId: userId,
      },
    });
  });

  await Promise.all(labelCreations);
}

// Edit Board
export async function handleEditBoard(data: BoardEditData) {
  const parse = EditBoardSchema.safeParse(data);

  if (!parse.success) {
    return { success: false, message: "Failed to edit board" };
  }

  try {
    await prisma.board.update({
      where: {
        id: parse.data.id,
      },
      data: {
        title: parse.data.title,
      },
    });

    revalidatePath(`/board/${parse.data.id}`);

    return { success: true, message: `Edited board successfully!` };
  } catch (e) {
    return { success: false, message: `Failed to edit board` };
  }
}

// Delete Board
export async function handleDeleteBoard(boardId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: "User is not authenticated" };
  }

  if (!boardId) {
    return { success: false, message: "Board ID is missing" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const owner = await tx.boardMember.findFirst({
        where: {
          boardId: boardId,
          userId: userId,
          role: "owner",
        },
      });

      if (!owner) {
        throw new Error("Only board owners can delete the board");
      }

      // Perform deletion operations within the transaction
      await tx.boardMember.deleteMany({
        where: { boardId: boardId },
      });

      await tx.board.delete({
        where: { id: boardId },
      });
    });

    // Revalidate the path after successful deletion
    revalidatePath(`/board/`);

    return { success: true, message: "Deleted board" };
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      message: error.message || "Failed to delete board",
    };
  }
}

// Edit Background Image
export async function handleEditBoardImage(url: string, boardId: string) {
  if (!url) {
    return { success: false, message: "No url provided" };
  }

  try {
    await prisma.board.update({
      where: {
        id: boardId,
      },
      data: {
        backgroundUrl: url,
      },
    });

    revalidatePath(`/board/${boardId}`);

    return { success: true, message: `Board image saved` };
  } catch (e) {
    console.error("Error updating board image:", e);
    return { success: false, message: `Failed to save board image` };
  }
}

// Set Background Image to Null
export async function handleRemoveBoardImage(boardId: string) {
  if (!boardId) {
    return { success: false, message: "No board ID provided" };
  }

  try {
    await prisma.board.update({
      where: {
        id: boardId,
      },
      data: {
        backgroundUrl: null,
      },
    });

    revalidatePath(`/board/${boardId}`);

    return { success: true, message: "Board image removed" };
  } catch (e) {
    return { success: false, message: "Failed to remove board image" };
  }
}

interface TaskData {
  id: string;
  order: number;
  columnId: string;
}

interface ColumnData {
  id: string;
  order: number;
  tasks: TaskData[];
}

interface BoardData {
  columns: ColumnData[];
}

// Server action for saving board and task positions.
export async function handleUpdateBoard(boardId: string, boardData: BoardData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    await prisma.$transaction(async (prisma) => {
      // Updating columns
      for (const column of boardData.columns) {
        if (column.id) {
          await prisma.column.update({
            where: { id: column.id },
            data: { order: column.order },
          });
        }
      }

      // Updating tasks and creating activity entries if needed
      for (const column of boardData.columns) {
        for (const task of column.tasks) {
          if (task.id) {
            // Fetch the original task data
            const originalTask = await prisma.task.findUnique({
              where: { id: task.id },
            });

            // Update the task
            await prisma.task.update({
              where: { id: task.id },
              data: {
                order: task.order,
                columnId: column.id,
              },
            });

            // Check if the task has been moved to a different column
            if (originalTask && originalTask.columnId !== column.id) {
              // Create a 'TASK_MOVED' activity entry
              await prisma.activity.create({
                data: {
                  type: ActivityType.TASK_MOVED,
                  userId: userId,
                  taskId: task.id,
                  boardId: boardId,
                  oldColumnId: originalTask.columnId,
                  newColumnId: column.id,
                },
              });
            }
          }
        }
      }
    });

    revalidatePath(`/board/${boardId}`);

    return { success: true, message: "Saved changes" };
  } catch (error) {
    console.error("Error updating board:", error);

    return { success: false, message: "Error saving changes" };
  }
}