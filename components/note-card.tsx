"use client";

import { Pencil, Trash2, Pin, PinOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  /** Props spread onto the drag handle (from dnd-kit useSortable listeners). */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  /** Hide the drag handle (e.g. while searching, when reordering is disabled). */
  showDragHandle?: boolean;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  dragHandleProps,
  showDragHandle = true,
}: NoteCardProps) {
  return (
    <Card className={cn("flex flex-col", note.isPinned && "border-primary/40")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">
            {note.isPinned && (
              <Pin className="mr-1 inline h-4 w-4 fill-current align-[-2px] text-primary" />
            )}
            {note.title}
          </CardTitle>
          {showDragHandle && (
            <button
              type="button"
              aria-label="Drag to reorder"
              className="-mr-1 mt-0.5 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
              {...dragHandleProps}
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-4 flex-1 whitespace-pre-wrap text-sm text-muted-foreground">
          {note.content || "No content"}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDate(note.updatedAt)}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePin(note)}
              aria-label={note.isPinned ? "Unpin note" : "Pin note"}
              className={note.isPinned ? "text-primary" : ""}
            >
              {note.isPinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              aria-label="Edit note"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(note)}
              aria-label="Delete note"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
