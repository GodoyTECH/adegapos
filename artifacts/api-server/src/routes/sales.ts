import { Router } from "express";
import { db, salesTable, saleItemsTable, paymentsTable, productsTable, compositeProductItemsTable, stockMovementsTable, usersTable, cashSessionsTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

async function formatSale(sale: any, userId: number) {
  const items = await db.select().from(saleItemsTable).where(eq(saleItemsTable.saleId, sale.id));
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.saleId, sale.id));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sale.userId)).limit(1);

  return {
    id: sale.id,
    userId: sale.userId,
    userName: user?.name ?? "Unknown",
    cashSessionId: sale.cashSessionId,
    subtotal: parseFloat(sale.subtotal),
    discount: parseFloat(sale.discount),
    total: parseFloat(sale.total),
    status: sale.status,
    cancellationReason: sale.cancellationReason,
    paymentMethods: payments.map(p => ({ id: p.id, method: p.method, amount: parseFloat(p.amount), status: p.status })),
    items: items.map(i => ({
      id: i.id, productId: i.productId, productNameSnapshot: i.productNameSnapshot,
      quantity: parseFloat(i.quantity), unitPrice: parseFloat(i.unitPrice), total: parseFloat(i.total),
    })),
    createdAt: sale.createdAt,
  };
}

router.get("/sales", requireAuth, async (req, res) => {
  try {
    const { from, to, status, userId } = req.query;
    let query = db.select().from(salesTable).orderBy(sql`${salesTable.createdAt} desc`).limit(200);
    const sales = await query;

    let filtered = sales;
    if (from) filtered = filtered.filter(s => s.createdAt >= new Date(String(from)));
    if (to) {
      const toDate = new Date(String(to));
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => s.createdAt <= toDate);
    }
    if (status) filtered = filtered.filter(s => s.status === status);
    if (userId) filtered = filtered.filter(s => s.userId === parseInt(String(userId)));

    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, u]));

    const result = await Promise.all(filtered.map(async sale => {
      const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.saleId, sale.id));
      return {
        id: sale.id, userId: sale.userId,
        userName: userMap.get(sale.userId)?.name ?? "Unknown",
        cashSessionId: sale.cashSessionId,
        subtotal: parseFloat(sale.subtotal), discount: parseFloat(sale.discount), total: parseFloat(sale.total),
        status: sale.status, cancellationReason: sale.cancellationReason,
        paymentMethods: payments.map(p => ({ id: p.id, method: p.method, amount: parseFloat(p.amount), status: p.status })),
        createdAt: sale.createdAt,
      };
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "list sales error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/sales", requireAuth, async (req, res) => {
  try {
    const { cashSessionId, discount = 0, items, payments, notes } = req.body;
    if (!items || items.length === 0) {
      res.status(400).json({ error: "Sale must have at least one item" });
      return;
    }
    if (!payments || payments.length === 0) {
      res.status(400).json({ error: "Sale must have at least one payment method" });
      return;
    }

    const subtotal = items.reduce((sum: number, i: any) => sum + i.quantity * i.unitPrice, 0);
    const total = subtotal - parseFloat(String(discount));

    const [sale] = await db.insert(salesTable).values({
      userId: req.user!.id,
      cashSessionId: cashSessionId || null,
      subtotal: String(subtotal), discount: String(discount), total: String(total),
      status: "completed", notes: notes || null,
    }).returning();

    // Insert items
    for (const item of items) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
      if (!product) continue;
      await db.insert(saleItemsTable).values({
        saleId: sale!.id, productId: item.productId,
        productNameSnapshot: product.name,
        quantity: String(item.quantity), unitPrice: String(item.unitPrice),
        total: String(item.quantity * item.unitPrice),
      });

      // Stock deduction
      if (product.productType === "simple") {
        const prev = parseFloat(product.stockQuantity);
        const newQty = prev - item.quantity;
        await db.update(productsTable).set({ stockQuantity: String(newQty), updatedAt: new Date() }).where(eq(productsTable.id, item.productId));
        await db.insert(stockMovementsTable).values({
          productId: item.productId, userId: req.user!.id, saleId: sale!.id,
          type: "sale", quantity: String(item.quantity),
          previousQuantity: String(prev), newQuantity: String(newQty),
          reason: `Venda #${sale!.id}`,
        });
      } else if (product.productType === "composite") {
        // Deduct each ingredient
        const compositeItems = await db.select().from(compositeProductItemsTable)
          .where(eq(compositeProductItemsTable.compositeProductId, item.productId));

        for (const ci of compositeItems) {
          const [ingredient] = await db.select().from(productsTable).where(eq(productsTable.id, ci.ingredientProductId)).limit(1);
          if (!ingredient) continue;
          const deductQty = parseFloat(ci.quantityUsed) * item.quantity;
          const prev = parseFloat(ingredient.stockQuantity);
          const newQty = prev - deductQty;
          await db.update(productsTable).set({ stockQuantity: String(newQty), updatedAt: new Date() }).where(eq(productsTable.id, ci.ingredientProductId));
          await db.insert(stockMovementsTable).values({
            productId: ci.ingredientProductId, userId: req.user!.id, saleId: sale!.id,
            type: "sale_composite", quantity: String(deductQty),
            previousQuantity: String(prev), newQuantity: String(newQty),
            reason: `Venda composto #${sale!.id} - ${product.name}`,
          });
        }
      }
    }

    // Insert payments
    for (const payment of payments) {
      await db.insert(paymentsTable).values({
        saleId: sale!.id, method: payment.method, amount: String(payment.amount), status: "completed",
      });
    }

    const fullSale = await formatSale(sale!, req.user!.id);
    res.status(201).json(fullSale);
  } catch (err) {
    req.log.error({ err }, "create sale error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/sales/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, id)).limit(1);
    if (!sale) { res.status(404).json({ error: "Not found" }); return; }
    const full = await formatSale(sale, req.user!.id);
    res.json(full);
  } catch (err) {
    req.log.error({ err }, "get sale error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/sales/:id/cancel", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const { reason } = req.body;
    const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, id)).limit(1);
    if (!sale) { res.status(404).json({ error: "Not found" }); return; }
    if (sale.status === "cancelled") { res.status(400).json({ error: "Already cancelled" }); return; }

    // Restore stock
    const items = await db.select().from(saleItemsTable).where(eq(saleItemsTable.saleId, id));
    for (const item of items) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
      if (!product) continue;
      if (product.productType === "simple") {
        const prev = parseFloat(product.stockQuantity);
        const qty = parseFloat(item.quantity);
        const newQty = prev + qty;
        await db.update(productsTable).set({ stockQuantity: String(newQty), updatedAt: new Date() }).where(eq(productsTable.id, item.productId));
        await db.insert(stockMovementsTable).values({
          productId: item.productId, userId: req.user!.id, saleId: id,
          type: "sale_cancellation", quantity: String(qty),
          previousQuantity: String(prev), newQuantity: String(newQty),
          reason: `Cancelamento venda #${id}: ${reason}`,
        });
      }
    }

    const [updated] = await db.update(salesTable).set({
      status: "cancelled", cancellationReason: reason, updatedAt: new Date(),
    }).where(eq(salesTable.id, id)).returning();

    const full = await formatSale(updated!, req.user!.id);
    res.json(full);
  } catch (err) {
    req.log.error({ err }, "cancel sale error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
