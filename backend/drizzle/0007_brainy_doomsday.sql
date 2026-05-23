CREATE TYPE "public"."drink_type" AS ENUM('juice', 'coffee', 'tea', 'water', 'soda', 'smoothie', 'other');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'all_day');--> statement-breakpoint
CREATE TYPE "public"."menu_category" AS ENUM('food', 'drink');--> statement-breakpoint
CREATE TYPE "public"."top_up_payment_method" AS ENUM('cash', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."top_up_status" AS ENUM('pending', 'cashier_approved', 'manager_approved', 'rejected');--> statement-breakpoint
CREATE TABLE "top_up_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"lounge_id" uuid NOT NULL,
	"amount" varchar(20) NOT NULL,
	"payment_method" "top_up_payment_method" NOT NULL,
	"receipt_image_url" varchar(500),
	"status" "top_up_status" DEFAULT 'pending' NOT NULL,
	"cashier_id" uuid,
	"manager_id" uuid,
	"rejection_reason" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "category" "menu_category";--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "meal_type" "meal_type";--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "drink_type" "drink_type";--> statement-breakpoint
ALTER TABLE "top_up_requests" ADD CONSTRAINT "top_up_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "top_up_requests" ADD CONSTRAINT "top_up_requests_lounge_id_lounges_id_fk" FOREIGN KEY ("lounge_id") REFERENCES "public"."lounges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "top_up_requests" ADD CONSTRAINT "top_up_requests_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "top_up_requests" ADD CONSTRAINT "top_up_requests_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;