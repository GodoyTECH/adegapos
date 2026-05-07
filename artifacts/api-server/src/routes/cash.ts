import { Router } from "express";
import { db, cashSessionsTable, cashMovementsTable, usersTable, salesTable, paymentsTable } from "@workspace/db";
import { eq, and, sum, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

function formatSession(s: any, user: any, totals?: { totalSales: number; salesCount: number }) {
  return {
    id: s.id,
    userId: s.userId,
    userName: user?.name ?? "Unknown",
    openingAmount: parseFloat(s.openingAmount),
    expectedAmount: s.expectedAmount ? parseFloat(s.expectedAmount) : null,
    closingAmount: s.closingAmount ? parseFloat(s.closingAmount) : null,
    status: s.status,
    openedAt: s.openedAt,
    closedAt: s.closedAt,
    totalSales: totals?.totalSales ?? null,
    salesCount: totals?.salesCount ?? null,
  };
}

router.get("/cash/current", requireAuth, async (req, res) => {
  try {
    const [session] = await db.select().from(cashSessionsTable).where(eq(cashSessionsTable.status, "open")).orderBy(cashSessionsTable.openedAt).limit(1);
    if (!session) { res.status(404).json({ error: "No open session" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    const [totals] = await db.select({ total: sum(salesTable.total), cnt: count(salesTable.id) })
      .from(salesTable)
      .where(and(eq(salesTable.cashSessionId, session.id), eq(salesTable.status, "completed")));
    res.json(formatSession(session, user, { totalSales: parseFloat(String(totals?.total ?? 0)), salesCount: Number(totals?.cnt ?? 0) }));
  } catch (err) {
    req.log.error({ err }, "get current cash session error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/cash/open", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { openingAmount } = req.body;
    const existing = await db.select().from(cashSessionsTable).where(eq(cashSessionsTable.status, "open")).limit(1);
    if (existing.length) {
      res.status(400).json({ error: "There is already an open cash session" });
      return;
    }
    const [session] = await db.insert(cashSessionsTable).values({
      userId: req.user!.id,
      openingAmount: String(openingAmount),
    }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    res.status(201).json(formatSession(session!, user));
  } catch (err) {
    req.log.error({ err }, "open cash session error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/cash/:id/close", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const { closingAmount } = req.body;
    const [totals] = await db.select({ total: sum(salesTable.total) })
      .from(salesTable)
      .where(and(eq(salesTable.cashSessionId, id), eq(salesTable.status, "completed")));
    const [movements] = await db.select({ total: sum(cashMovementsTable.amount) })
      .from(cashMovementsTable)
      .where(eq(cashMovementsTable.cashSessionId, id));
    const [session] = await db.select().from(cashSessionsTable).where(eq(cashSessionsTable.id, id)).limit(1);
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    const salesTotal = parseFloat(String(totals?.total ?? 0));
    const expected = parseFloat(session.openingAmount) + salesTotal + parseFloat(String(movements?.total ?? 0));
    const [updated] = await db.update(cashSessionsTable).set({
      status: "closed",
      closingAmount: String(closingAmount),
      expectedAmount: String(expected),
      closedAt: new Date(),
    }).where(eq(cashSessionsTable.id, id)).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated!.userId)).limit(1);
    res.json(formatSession(updated!, user));
  } catch (err) {
    req.log.error({ err }, "close cash session error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/cash/:id/movements", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const cashSessionId = parseInt(req.params.id!);
    const { type, amount, reason } = req.body;
    const [movement] = await db.insert(cashMovementsTable).values({
      cashSessionId, userId: req.user!.id, type, amount: String(amount), reason,
    }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    res.status(201).json({
      id: movement!.id, cashSessionId, userId: req.user!.id,
      userName: user?.name ?? "", type: movement!.type,
      amount: parseFloat(movement!.amount), reason: movement!.reason, createdAt: movement!.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "create cash movement error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/cash/sessions", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const sessions = await db.select().from(cashSessionsTable).orderBy(cashSessionsTable.openedAt);
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, u]));
    res.json(sessions.map(s => formatSession(s, userMap.get(s.userId))));
  } catch (err) {
    req.log.error({ err }, "list cash sessions error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
