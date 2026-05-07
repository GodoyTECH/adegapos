import { Router } from "express";
import { db, productsTable, categoriesTable, stockMovementsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/stock", requireAuth, async (req, res) => {
  try {
    const { lowStock, search } = req.query;
    const rows = await db
      .select({
        productId: productsTable.id,
        productName: productsTable.name,
        categoryName: categoriesTable.name,
        stockQuantity: productsTable.stockQuantity,
        minStock: productsTable.minStock,
        unitType: productsTable.unitType,
        active: productsTable.active,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.active, true));

    const lastMovements = await db
      .select({ productId: stockMovementsTable.productId, lastMovementAt: sql`MAX(${stockMovementsTable.createdAt})` })
      .from(stockMovementsTable)
      .groupBy(stockMovementsTable.productId);
    const lastMoveMap = new Map(lastMovements.map(m => [m.productId, m.lastMovementAt]));

    let result = rows.map(r => {
      const qty = parseFloat(r.stockQuantity);
      const min = parseFloat(r.minStock);
      const status = qty <= 0 ? "zero" : qty <= min ? "low" : "normal";
      return {
        productId: r.productId,
        productName: r.productName,
        categoryName: r.categoryName ?? null,
        stockQuantity: qty,
        minStock: min,
        unitType: r.unitType,
        status,
        lastMovementAt: lastMoveMap.get(r.productId) ?? null,
      };
    });

    if (search) result = result.filter(r => r.productName.toLowerCase().includes(String(search).toLowerCase()));
    if (lowStock === "true") result = result.filter(r => r.status !== "normal");

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "list stock error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/stock/movements", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { productId, type, quantity, reason } = req.body;
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    const previousQty = parseFloat(product.stockQuantity);
    const qty = parseFloat(String(quantity));
    const isDeduction = ["loss", "breakage", "expiration"].includes(type);
    const newQty = isDeduction ? previousQty - qty : previousQty + qty;

    await db.update(productsTable).set({ stockQuantity: String(newQty), updatedAt: new Date() }).where(eq(productsTable.id, productId));

    const [movement] = await db.insert(stockMovementsTable).values({
      productId, userId: req.user!.id, type,
      quantity: String(qty), previousQuantity: String(previousQty),
      newQuantity: String(newQty), reason: reason || null,
    }).returning();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    res.status(201).json({
      id: movement!.id, productId, productName: product.name,
      userId: req.user!.id, userName: user?.name ?? "",
      type, quantity: qty, previousQuantity: previousQty, newQuantity: newQty,
      reason: movement!.reason, createdAt: movement!.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "create stock movement error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
