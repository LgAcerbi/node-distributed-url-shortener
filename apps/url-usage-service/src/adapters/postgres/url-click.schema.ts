import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

const postgresUrlClickSchema = pgTable('url_clicks', {
    id: uuid('id').primaryKey(),
    shortUrlCode: varchar('short_url_code', { length: 7 }).notNull(),
    clickedAt: timestamp('clicked_at').notNull(),
    createdAt: timestamp('created_at').notNull(),
});

const urlClickDbSchema = {
    urlClicks: postgresUrlClickSchema,
};

type UrlClickDbSchema = typeof urlClickDbSchema;

export default postgresUrlClickSchema;
export { postgresUrlClickSchema, urlClickDbSchema };
export type { UrlClickDbSchema };
