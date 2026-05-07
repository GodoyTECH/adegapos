import { pgTable, serial, integer, numeric, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { productsTable } from "./products";
import { salesTable } from "./sales";

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "entry",
  "sale",
  "sale_composite",
  "manual_adjustment",
  "loss",
  "breakage",
  "expiration",
  "return",
  "sale_cancellation",
]);

export const stockMovementsTable = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  saleId: integer("sale_id").references(() => salesTable.id),
  type: stockMovementTypeEnum("type").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull(),
  previousQuantity: numeric("previous_quantity", { precision: 10, scale: 3 }).notNull(),
  newQuantity: numeric("new_quantity", { precision: 10, scale: 3 }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type StockMovement = typeof stockMovementsTable.$inferSelect;
