import { pgTable, serial, integer, numeric, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const cashSessionStatusEnum = pgEnum("cash_session_status", ["open", "closed"]);
export const cashMovementTypeEnum = pgEnum("cash_movement_type", ["withdrawal", "supply"]);

export const cashSessionsTable = pgTable("cash_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  openingAmount: numeric("opening_amount", { precision: 10, scale: 2 }).notNull(),
  expectedAmount: numeric("expected_amount", { precision: 10, scale: 2 }),
  closingAmount: numeric("closing_amount", { precision: 10, scale: 2 }),
  status: cashSessionStatusEnum("status").notNull().default("open"),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const cashMovementsTable = pgTable("cash_movements", {
  id: serial("id").primaryKey(),
  cashSessionId: integer("cash_session_id").notNull().references(() => cashSessionsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  type: cashMovementTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CashSession = typeof cashSessionsTable.$inferSelect;
export type CashMovement = typeof cashMovementsTable.$inferSelect;
