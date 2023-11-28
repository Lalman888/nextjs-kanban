'use client'

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { handleDeleteTask} from "@/actions/TaskActions";
import { IconTrash } from "@tabler/icons-react";
import toast from "react-hot-toast";

function DeleteButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      aria-disabled={pending}
      className="p-1 bg-red-500 text-white rounded-md"
    >
      <IconTrash size={14} />
    </button>
  )
}

export default function DeleteTaskForm({ boardId, taskId, columnId }: { boardId: string; taskId: string; columnId: string; }) {
  const [state, formAction] = useFormState(handleDeleteTask, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state?.success, state?.message]);

  return (
    <>
    <form 
      action={formAction}
      className="leading-none"
      onSubmit={(e) => {
        e.preventDefault();
        const confimed = confirm("Are you sure you want to delete this task?");
        if (confimed) {
          formAction(new FormData(e.currentTarget));
        }
      }}
    >
      <input type="hidden" name="columnId" value={columnId} />
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="taskId" value={taskId} />
      <DeleteButton />
      <p aria-live="polite" className="sr-only" role="status">
        {state?.message}
      </p>
    </form>
    </>
  )
}
