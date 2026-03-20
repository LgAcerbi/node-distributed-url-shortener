import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';

const postgresUrlClickSchema = pgTable('url_clicks', {
    id: uuid('id').primaryKey(),
    shortUrlId: uuid('short_url_id').notNull(),
    clientIp: varchar('client_ip', { length: 45 }),
    userAgent: text('user_agent'),
    referer: text('referer'),
    kafkaMessageId: varchar('kafka_message_id', { length: 512 }).notNull(),
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
