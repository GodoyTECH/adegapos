import { Router } from "express";
import { db, salesTable, saleItemsTable, paymentsTable, productsTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, sql, sum, count, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/reports/sales", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { from, to, userId } = req.query;
    if (!from || !to) { res.status(400).json({ error: "from and to are required" }); return; }
    const start = new Date(String(from)); start.setHours(0, 0, 0, 0);
    const end = new Date(String(to)); end.setHours(23, 59, 59, 999);

    let sales = await db.select().from(salesTable)
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, start), lte(salesTable.createdAt, end)))
      .orderBy(sql`${salesTable.createdAt} desc`);

    if (userId) sales = sales.filter(s => s.userId === parseInt(String(userId)));

    const totalRevenue = sales.reduce((s, sale) => s + parseFloat(sale.total), 0);
    const totalDiscount = sales.reduce((s, sale) => s + parseFloat(sale.discount), 0);
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, u]));

    const salesWithPayments = await Promise.all(sales.map(async sale => {
      const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.saleId, sale.id));
      return {
        id: sale.id, userId: sale.userId, userName: userMap.get(sale.userId)?.name ?? "Unknown",
        cashSessionId: sale.cashSessionId,
        subtotal: parseFloat(sale.subtotal), discount: parseFloat(sale.discount), total: parseFloat(sale.total),
        status: sale.status, cancellationReason: sale.cancellationReason,
        paymentMethods: payments.map(p => ({ id: p.id, method: p.method, amount: parseFloat(p.amount), status: p.status })),
        createdAt: sale.createdAt,
      };
    }));

    res.json({
      totalRevenue,
      totalSales: sales.length,
      totalDiscount,
      avgTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
      sales: salesWithPayments,
    });
  } catch (err) {
    req.log.error({ err }, "sales report error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/reports/products", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) { res.status(400).json({ error: "from and to are required" }); return; }
    const start = new Date(String(from)); start.setHours(0, 0, 0, 0);
    const end = new Date(String(to)); end.setHours(23, 59, 59, 999);

    const rows = await db.select({
      productId: saleItemsTable.productId,
      productName: productsTable.name,
      categoryName: categoriesTable.name,
      costPrice: productsTable.costPrice,
      salePrice: productsTable.salePrice,
      marginPercentage: productsTable.marginPercentage,
      quantitySold: sum(saleItemsTable.quantity),
      revenue: sum(saleItemsTable.total),
    })
      .from(saleItemsTable)
      .innerJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
      .innerJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(salesTable.status, "completed"), gte(salesTable.createdAt, start), lte(salesTable.createdAt, end)))
      .groupBy(saleItemsTable.productId, productsTable.name, categoriesTable.name, productsTable.costPrice, productsTable.salePrice, productsTable.marginPercentage)
      .orderBy(desc(sum(saleItemsTable.total)));

    res.json(rows.map(r => {
      const rev = parseFloat(String(r.revenue ?? 0));
      const qty = parseFloat(String(r.quantitySold ?? 0));
      const cost = r.costPrice ? parseFloat(r.costPrice) : null;
      const estimatedProfit = cost ? rev - (cost * qty) : 0;
      return {
        productId: r.productId,
        productName: r.productName,
        categoryName: r.categoryName ?? null,
        costPrice: cost,
        salePrice: parseFloat(r.salePrice),
        marginPercentage: r.marginPercentage ? parseFloat(r.marginPercentage) : null,
        quantitySold: qty,
        revenue: rev,
        estimatedProfit,
      };
    }));
  } catch (err) {
    req.log.error({ err }, "products report error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
