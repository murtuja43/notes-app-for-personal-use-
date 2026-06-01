"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NoteCard } from "@/components/note-card";
import type { Note } from "@/types";

interface SortableNoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

/** Wraps NoteCard with dnd-kit sortable behaviour; the grip is the drag handle. */
export function SortableNoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: SortableNoteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <NoteCard
        note={note}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
