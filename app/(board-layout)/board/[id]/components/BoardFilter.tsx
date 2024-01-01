'use client'
import { useState } from "react";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import { LabelSummary } from "@/types/types";
import { IconFilter } from "@tabler/icons-react";

const LabelColorIndicator = ({ color } : { color: string }) => (
    <div className={`h-4 w-4 rounded-full bg-${color}-500`} />
);

export default function BoardFilter({
    labels
} : {
    labels: LabelSummary[]
}) {
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSelectionChange = (values: string[]) => {
        setSelectedLabels(values);
        setPopoverOpen(false);

        const params = new URLSearchParams(searchParams);
        if (values.length > 0) {
            params.set('labels', values.join(','));
        } else {
            params.delete('labels');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <Popover 
            placement="bottom" 
            showArrow 
            backdrop="blur" 
            isOpen={popoverOpen}
            onOpenChange={setPopoverOpen}
        >
            <PopoverTrigger>
                <Button color="primary" size="sm" isIconOnly>
                    <IconFilter size={16} />
                </Button>
            </PopoverTrigger>

            <PopoverContent>
                <div className="px-1 py-3 w-64 space-y-2">
                    <CheckboxGroup
                        label="Filter by label"
                        color="primary"
                        value={selectedLabels}
                        onValueChange={handleSelectionChange}
                    >
                        {labels.map(label => (
                            <Checkbox 
                                key={label.id} 
                                value={label.id}
                                className="flex justify-between"
                            >
                                {label.title}
                                <LabelColorIndicator color={label.color} />
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                </div>
            </PopoverContent>
        </Popover>
    );
}
