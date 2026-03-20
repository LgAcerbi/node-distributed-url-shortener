import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core"

const postgresShortUrlSchema = pgTable("short_urls", {
    id: uuid("id").primaryKey(),
    code: varchar("code", { length: 7 }).notNull(),
    url: varchar("original_url", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    deletedAt: timestamp("deleted_at"),
})

export default postgresShortUrlSchema
export { postgresShortUrlSchema }