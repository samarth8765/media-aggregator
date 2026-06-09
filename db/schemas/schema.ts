import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  postId: text("post_id"),
  author: text("author"),
  authorUrl: text("author_url"),
  content: text("content"),
  postUrl: text("post_url"),
  reactionType: text("reaction_type"),
  postedAt: timestamp("posted_at"),
  scrapedAt: timestamp("scraped_at").notNull().defaultNow(),
});
