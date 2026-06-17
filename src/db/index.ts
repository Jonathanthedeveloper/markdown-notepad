import { createCollection } from "@tanstack/react-db"
import { dexieCollectionOptions } from "tanstack-dexie-db-collection"
import { z } from "zod"

const noteSchema = z.object({
    id: z.string(),
    title: z.string(),
    body: z.string(),
    pinned: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export const notesCollection = createCollection(
    dexieCollectionOptions({
        id: "notes",
        schema: noteSchema,
        getKey: (item) => item.id,
        dbName: "markdown-notepad",
        tableName: "notes",
    })
)

