import { Board, Column, Task, Activity, User, Label, Checklist, ChecklistItem } from "@prisma/client";

export type BoardSummary = Pick<Board, 'id' | 'title' | 'backgroundUrl'> & {
    tasksCount: number;
    isFavorited: boolean;
};

export type BoardDetails = BoardSummary & {
    columns: ColumnWithTasks[];
};

export type ColumnWithTasks = Pick<Column, 'id' | 'title' | 'order'> & {
    tasks: TaskSummary[];
};

export type TaskSummary = Pick<Task, 'id' | 'order' | 'title' | 'description' | 'columnId' | 'dueDate' | 'startDate'> & {
    labels: LabelSummary[];
};

export type ChecklistItemSummary = Pick<ChecklistItem, 'id' | 'content' | 'isChecked' | 'createdAt'>;

export type ChecklistSummary = Pick<Checklist, 'id' | 'title'> & {
    items: ChecklistItemSummary[];
};

export type ExpandedTask = Pick<Task, 'id' | 'order' | 'title' | 'description' | 'dueDate' | 'startDate' | 'createdAt' | 'updatedAt' | 'columnId'> & {
    activities: ActivityWithUser[];
    column: Pick<Column, 'title' | 'boardId'>;
    labels: LabelSummary[];
    checklists: ChecklistSummary[];
};

export type LabelSummary = Pick<Label, 'id' | 'title' | 'color'>;

export type ActivityWithUser = Pick<Activity, 'id' | 'type' | 'content' | 'createdAt' | 'startDate' | 'dueDate'> & {
    user: Pick<User, 'id' | 'name' | 'image'>,
    oldColumn: Pick<Column, 'title'> | null,
    newColumn: Pick<Column, 'title'> | null,
    originalColumn: Pick<Column, 'title'> | null
};



// Form validation
export type BoardCreationData = Pick<Board, 'title' | 'description'>;

export type BoardEditData = Pick<Board, 'title' | 'id'>;

export type BoardDeletionData = Pick<Board, 'id'>;

export type ColumnCreationData = {
    boardId: Board['id'];
    title: Column['title'];
};

export type ColumnDeletionData = {
    boardId: Board['id'];
    id: Column['id'];
};

export type TaskCreationData = {
    title: Task['title'];
    description?: Task['description'];
    boardId: Board['id'];
    columnId: Column['id'];
};

export type TaskEditData = {
    id: Task['id'];
    title: Task['title'];
    description?: Task['description'];
    boardId: Board['id'];
};

export type TaskDeletionData = {
    id: Task['id'];
    boardId: Board['id'];
    columnId: Column['id'];
};

export type ActivityCreationData = {
    type?: Activity['type'];
    content: Activity['content'];
    boardId: Board['id'];
    taskId: Task['id'];
};

export type ActivityDeletionData = {
    boardId: Board['id'];
    activityId: Activity['id'];
};
