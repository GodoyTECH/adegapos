import { Router } from "express";
import { db, salesTable, saleItemsTable, paymentsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and, gte, lte, sql, sum, count, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

function todayRange() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  return { start, end };
}

function yesterdayRange() {
  const start = new Date(); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999);
  return { start, end };
}

router.get("/dashboard/summary", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const date = req.query.date ? new Date(String(req.query.date)) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    const ystStart = new Date(date); ystStart.setDate(ystStart.getDate() - 1); ystStart.setHours(0, 0, 0, 0);
    const ystEnd = new Date(date); ystEnd.setDate(ystEnd.getDate() - 1); ystEnd.setHours(23, 59, 59, 999);

    const [todayStats] = await db.select({ total: sum(salesTable.total), cnt: count(salesTable.id) })
      .from(salesTable)
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, start), lte(salesTable.createdAt, end)));

    const [ystStats] = await db.select({ total: sum(salesTable.total), cnt: count(salesTable.id) })
      .from(salesTable)
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, ystStart), lte(salesTable.createdAt, ystEnd)));

    const todayCost = await db.select({
      cost: sql`SUM(${saleItemsTable.quantity} * ${productsTable.costPrice})`.as("cost"),
    })
      .from(saleItemsTable)
      .innerJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
      .innerJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, start), lte(salesTable.createdAt, end)));

    const products = await db.select({ stock: productsTable.stockQuantity, minStock: productsTable.minStock })
      .from(productsTable).where(eq(productsTable.active, true));
    const lowStockCount = products.filter(p => parseFloat(p.stockQuantity) > 0 && parseFloat(p.stockQuantity) <= parseFloat(p.minStock)).length;
    const zeroStockCount = products.filter(p => parseFloat(p.stockQuantity) <= 0).length;

    const revenueToday = parseFloat(String(todayStats?.total ?? 0));
    const salesCountToday = Number(todayStats?.cnt ?? 0);
    const estimatedProfit = revenueToday - parseFloat(String(todayCost[0]?.cost ?? 0));

    res.json({
      revenueToday,
      salesCountToday,
      avgTicketToday: salesCountToday > 0 ? revenueToday / salesCountToday : 0,
      estimatedProfit,
      revenueYesterday: parseFloat(String(ystStats?.total ?? 0)),
      salesCountYesterday: Number(ystStats?.cnt ?? 0),
      avgTicketYesterday: Number(ystStats?.cnt ?? 0) > 0
        ? parseFloat(String(ystStats?.total ?? 0)) / Number(ystStats?.cnt ?? 0) : 0,
      lowStockCount,
      zeroStockCount,
    });
  } catch (err) {
    req.log.error({ err }, "dashboard summary error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/dashboard/sales-by-hour", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const date = req.query.date ? new Date(String(req.query.date)) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const rows = await db.select({
      hour: sql`EXTRACT(HOUR FROM ${salesTable.createdAt})::int`.as("hour"),
      count: count(salesTable.id),
      revenue: sum(salesTable.total),
    })
      .from(salesTable)
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, start), lte(salesTable.createdAt, end)))
      .groupBy(sql`EXTRACT(HOUR FROM ${salesTable.createdAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${salesTable.createdAt})`);

    const hourMap = new Map(rows.map(r => [Number(r.hour), r]));
    const result = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: Number(hourMap.get(h)?.count ?? 0),
      revenue: parseFloat(String(hourMap.get(h)?.revenue ?? 0)),
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "sales by hour error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/dashboard/top-products", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit ?? 10));
    const { from, to } = req.query;
    const start = from ? new Date(String(from)) : (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
    const end = to ? (() => { const d = new Date(String(to)); d.setHours(23, 59, 59, 999); return d; })()
      : (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; })();

    const rows = await db.select({
      productId: saleItemsTable.productId,
      productName: productsTable.name,
      categoryName: categoriesTable.name,
      quantitySold: sum(saleItemsTable.quantity),
      revenue: sum(saleItemsTable.total),
    })
      .from(saleItemsTable)
      .innerJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
      .innerJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, start), lte(salesTable.createdAt, end)))
      .groupBy(saleItemsTable.productId, productsTable.name, categoriesTable.name)
      .orderBy(desc(sum(saleItemsTable.total)))
      .limit(limit);

    res.json(rows.map(r => ({
      productId: r.productId,
      productName: r.productName,
      categoryName: r.categoryName ?? null,
      quantitySold: parseFloat(String(r.quantitySold ?? 0)),
      revenue: parseFloat(String(r.revenue ?? 0)),
    })));
  } catch (err) {
    req.log.error({ err }, "top products error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/dashboard/payment-methods", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(String(from)) : (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
    const end = to ? (() => { const d = new Date(String(to)); d.setHours(23, 59, 59, 999); return d; })()
      : (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; })();

    const rows = await db.select({
      method: paymentsTable.method,
      count: count(paymentsTable.id),
      total: sum(paymentsTable.amount),
    })
      .from(paymentsTable)
      .innerJoin(salesTable, eq(paymentsTable.saleId, salesTable.id))
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, start), lte(salesTable.createdAt, end)))
      .groupBy(paymentsTable.method);

    res.json(rows.map(r => ({ method: r.method, count: Number(r.count), total: parseFloat(String(r.total ?? 0)) })));
  } catch (err) {
    req.log.error({ err }, "payment methods error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/dashboard/sales-by-category", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(String(from)) : (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
    const end = to ? (() => { const d = new Date(String(to)); d.setHours(23, 59, 59, 999); return d; })()
      : (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; })();

    const rows = await db.select({
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      revenue: sum(saleItemsTable.total),
      count: count(saleItemsTable.id),
    })
      .from(saleItemsTable)
      .innerJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
      .innerJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, start), lte(salesTable.createdAt, end)))
      .groupBy(categoriesTable.id, categoriesTable.name);

    res.json(rows.map(r => ({
      categoryId: r.categoryId ?? null,
      categoryName: r.categoryName ?? "Sem categoria",
      revenue: parseFloat(String(r.revenue ?? 0)),
      count: Number(r.count),
    })));
  } catch (err) {
    req.log.error({ err }, "sales by category error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/dashboard/low-stock", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const products = await db.select({
      productId: productsTable.id,
      productName: productsTable.name,
      stockQuantity: productsTable.stockQuantity,
      minStock: productsTable.minStock,
      unitType: productsTable.unitType,
    }).from(productsTable).where(eq(productsTable.active, true));

    const low = products.filter(p => {
      const qty = parseFloat(p.stockQuantity);
      const min = parseFloat(p.minStock);
      return qty <= min;
    });

    res.json(low.map(p => ({
      productId: p.productId,
      productName: p.productName,
      stockQuantity: parseFloat(p.stockQuantity),
      minStock: parseFloat(p.minStock),
      unitType: p.unitType,
      status: parseFloat(p.stockQuantity) <= 0 ? "zero" : "low",
    })));
  } catch (err) {
    req.log.error({ err }, "low stock error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
