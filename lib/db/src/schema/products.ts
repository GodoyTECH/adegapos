import { pgTable, serial, text, boolean, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productTypeEnum = pgEnum("product_type", ["simple", "composite"]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  name: text("name").notNull(),
  barcode: text("barcode").unique(),
  productType: productTypeEnum("product_type").notNull().default("simple"),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }).notNull(),
  marginPercentage: numeric("margin_percentage", { precision: 5, scale: 2 }),
  stockQuantity: numeric("stock_quantity", { precision: 10, scale: 3 }).notNull().default("0"),
  minStock: numeric("min_stock", { precision: 10, scale: 3 }).notNull().default("0"),
  unitType: text("unit_type").notNull().default("unidade"),
  imageUrl: text("image_url"),
  description: text("description"),
  preparationInstructions: text("preparation_instructions"),
  preparationTimeMinutes: integer("preparation_time_minutes"),
  internalNotes: text("internal_notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const compositeProductItemsTable = pgTable("composite_product_items", {
  id: serial("id").primaryKey(),
  compositeProductId: integer("composite_product_id").notNull().references(() => productsTable.id),
  ingredientProductId: integer("ingredient_product_id").notNull().references(() => productsTable.id),
  quantityUsed: numeric("quantity_used", { precision: 10, scale: 3 }).notNull(),
  unitType: text("unit_type").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
export type CompositeProductItem = typeof compositeProductItemsTable.$inferSelect;
