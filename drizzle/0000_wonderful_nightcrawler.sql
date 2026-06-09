CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"post_id" text,
	"author" text,
	"author_url" text,
	"content" text,
	"post_url" text,
	"reaction_type" text,
	"posted_at" timestamp,
	"scraped_at" timestamp DEFAULT now() NOT NULL
);
