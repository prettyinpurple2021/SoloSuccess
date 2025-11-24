CREATE TABLE "business_context" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"company_name" text,
	"founder_name" text,
	"industry" text,
	"description" text,
	"brand_dna" jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"agent_id" text NOT NULL,
	"role" text NOT NULL,
	"text" text NOT NULL,
	"timestamp" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitor_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"competitor_name" text NOT NULL,
	"threat_level" text,
	"data" jsonb,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"description" text,
	"assignee" text NOT NULL,
	"priority" text NOT NULL,
	"status" text DEFAULT 'todo',
	"estimated_time" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"password" text,
	"stack_user_id" text,
	"xp" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"total_actions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_stack_user_id_unique" UNIQUE("stack_user_id")
);
