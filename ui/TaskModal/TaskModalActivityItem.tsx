'use client'
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ActivityWithUser } from "@/types/types";
import { Avatar } from "@nextui-org/avatar";
import { IconEdit, IconMoodPlus, IconTrash } from "@tabler/icons-react";
import { handleDeleteActivity } from '@/actions/ActivityActions';

interface TaskModalActivityItemProps {
    activity: ActivityWithUser;
    columnTitle: string;
    boardId: string;
}

export default function TaskModalActivityItem({ activity, columnTitle, boardId }: TaskModalActivityItemProps) {
    const formattedDate = format(new Date(activity.createdAt), 'MM/dd/yyyy, HH:mm:ss');

    const handleEdit = () => {
        console.log("Edit comment");
        // Implement edit functionality
    };

    const handleReaction = () => {
        console.log("Add reaction");
        // Implement reaction functionality
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            const deletionData = {
                boardId: boardId,
                activityId: activity.id,
            };
            const response = await handleDeleteActivity(deletionData);
            if (response.success) {
                toast.success('Activity Deleted');
            } else {
                toast.error(response.message);
            }
        }
    };

    return (
        <li className="flex gap-2 items-start">
            <Avatar 
                showFallback 
                name={activity.user.name ?? 'Unknown'} 
                src={activity.user.image ?? undefined} 
                className="shrink-0 grow-0"
            />

            {activity.type === 'COMMENT_ADDED' ? (

                <div>
                    <div className="text-sm">
                        <span className="font-semibold">{activity.user.name} </span> 
                        <span className="text-xs text-zinc-500">{formattedDate}</span>
                    </div>
                    <div>
                        {activity.content}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleReaction}><IconMoodPlus className='text-zinc-500' size={16} /></button>
                        <button onClick={handleEdit}><IconEdit className='text-zinc-500' size={16} /></button>
                        <button onClick={handleDelete}><IconTrash className="text-red-500" size={16} /></button>
                    </div>
                </div>
            ) : (

                <div>
                    <div className="text-sm">
                        <span className="font-semibold">{activity.user.name} </span> 
                        {activity.content} {columnTitle || ''}
                    </div>
                    <div className="text-xs text-zinc-500">
                        {formattedDate}
                    </div>
                </div>
            )}
        </li>
    );
}
