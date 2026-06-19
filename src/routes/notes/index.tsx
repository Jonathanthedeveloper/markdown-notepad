import { buttonVariants } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { v7 as uuidV7 } from "uuid"
import { useLiveQuery } from "@tanstack/react-db"
import { notesCollection } from "@/db"
import { Trash2, Pin, Copy, Search, Upload } from "lucide-react"
import { useState, useMemo, useRef } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const Route = createFileRoute('/notes/')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const { data: notes, isLoading } = useLiveQuery(
    (q) => q.from({ notes: notesCollection })
  );

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedNotes = useMemo(() => {
    if (!notes) return [];
    const filtered = search
      ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.body.toLowerCase().includes(search.toLowerCase())
      )
      : notes;
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search]);

  const deleteNote = (id: string) => {
    notesCollection.delete(id);
    setDeleteTarget(null);
  };

  const togglePin = (id: string, current: boolean) => {
    notesCollection.update(id, (draft: any) => {
      draft.pinned = !current;
    });
  };

  const duplicateNote = (_id: string, title: string, body: string) => {
    notesCollection.insert({
      id: uuidV7(),
      title: title + " (copy)",
      body,
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const title = file.name.replace(/\.(md|txt|markdown)$/i, "");
      notesCollection.insert({
        id: uuidV7(),
        title,
        body: content,
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-semibold">My Notes</h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.markdown"
            onChange={importFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </button>
          <Link to='/notes/$id' params={{ id: uuidV7() }} className={buttonVariants()}>New Note</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {!isLoading && sortedNotes.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            {search ? "No matching notes found." : "No notes yet. Create one!"}
          </p>
        )}
        <div className="grid gap-2">
          {sortedNotes?.map((note) => (
            <div key={note.id} className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
              <Link
                to="/notes/$id"
                params={{ id: note.id }}
                className="flex-1 min-w-0"
              >
                <h2 className="truncate text-sm font-medium">
                  {note.pinned && <Pin className="mr-1 inline h-3 w-3 text-primary" />}
                  {note.title || "Untitled"}
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </Link>
              <div className="ml-2 flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => togglePin(note.id, note.pinned)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  title={note.pinned ? "Unpin" : "Pin"}
                >
                  <Pin className={`h-4 w-4 ${note.pinned ? "fill-primary text-primary" : ""}`} />
                </button>
                <button
                  onClick={() => duplicateNote(note.id, note.title, note.body)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <AlertDialog open={deleteTarget?.id === note.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                  <AlertDialogTrigger
                    render={
                      <button
                        className="p-1 text-muted-foreground hover:text-destructive"
                        title="Delete"
                        onClick={() => setDeleteTarget({ id: note.id, title: note.title || "Untitled" })}
                      />
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => deleteTarget && deleteNote(deleteTarget.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
