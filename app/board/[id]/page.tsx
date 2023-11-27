import { getBoard } from "@/lib/FetchData";
import { BoardDetails } from "@/types/types";
import NewColumnForm from "@/ui/Forms/NewColumnForm";
import Column from "@/ui/Task/Column";
import TaskItem from "@/ui/Task/TaskItem";

interface BoardProps {
  params: { id: string };
}

export default async function Board({ params }: BoardProps) {
  const board: BoardDetails | null = await getBoard(params.id);

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div className="flex gap-x-5">
      {board.columns.map(column => (
        <Column key={column.id} title={column.title} columnId={column.id} boardId={board.id}>
          {column.tasks.map(task => (
            <TaskItem 
              key={task.id} 
              title={task.title} 
              priority={task.priority} 
            />
          ))}
        </Column>
      ))}
      <div className="bg-blue-300 p-5 w-64 rounded-lg">
        <NewColumnForm boardId={board.id} />
      </div>
    </div>
  );
}