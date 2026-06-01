"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Note } from "@/types";

interface ConfirmDeleteDialogProps {
  note: Note | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function ConfirmDeleteDialog({
  note,
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!note) return;
    setError(null);
    setDeleting(true);
    try {
      await onConfirm(note.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete note");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog
      open={note !== null}
      onClose={deleting ? () => {} : onClose}
      className="max-w-md"
    >
      <DialogHeader>
        <DialogTitle>Delete note?</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        This will permanently delete{" "}
        <span className="font-medium text-foreground">
          {note?.title}
        </span>
        . This action cannot be undone.
      </p>

      {error && (
        <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
          disabled={deleting}
        >
          {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
          Delete
        </Button>
      </div>
    </Dialog>
  );
}
