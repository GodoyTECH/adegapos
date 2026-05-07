import { Router } from "express";
import { db, productsTable, categoriesTable, compositeProductItemsTable, stockMovementsTable } from "@workspace/db";
import { eq, and, ilike, or, lte, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

function formatProduct(p: any, cat?: any) {
  const salePrice = parseFloat(p.salePrice);
  const costPrice = p.costPrice ? parseFloat(p.costPrice) : null;
  const margin = costPrice ? ((salePrice - costPrice) / salePrice) * 100 : null;
  return {
    id: p.id,
    categoryId: p.categoryId,
    categoryName: cat?.name ?? p.categoryName ?? null,
    name: p.name,
    barcode: p.barcode,
    productType: p.productType,
    costPrice,
    salePrice,
    marginPercentage: margin ? parseFloat(margin.toFixed(2)) : null,
    stockQuantity: parseFloat(p.stockQuantity),
    minStock: parseFloat(p.minStock),
    unitType: p.unitType,
    imageUrl: p.imageUrl,
    description: p.description,
    preparationInstructions: p.preparationInstructions,
    preparationTimeMinutes: p.preparationTimeMinutes,
    internalNotes: p.internalNotes,
    active: p.active,
    createdAt: p.createdAt,
  };
}

router.get("/products", requireAuth, async (req, res) => {
  try {
    const { search, categoryId, active, lowStock, productType } = req.query;

    const rows = await db
      .select({
        id: productsTable.id,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        name: productsTable.name,
        barcode: productsTable.barcode,
        productType: productsTable.productType,
        costPrice: productsTable.costPrice,
        salePrice: productsTable.salePrice,
        marginPercentage: productsTable.marginPercentage,
        stockQuantity: productsTable.stockQuantity,
        minStock: productsTable.minStock,
        unitType: productsTable.unitType,
        imageUrl: productsTable.imageUrl,
        description: productsTable.description,
        preparationInstructions: productsTable.preparationInstructions,
        preparationTimeMinutes: productsTable.preparationTimeMinutes,
        internalNotes: productsTable.internalNotes,
        active: productsTable.active,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

    let filtered = rows;
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(String(search).toLowerCase()) || p.barcode?.includes(String(search)));
    if (categoryId) filtered = filtered.filter(p => p.categoryId === parseInt(String(categoryId)));
    if (active !== undefined) filtered = filtered.filter(p => p.active === (active === "true"));
    if (lowStock === "true") filtered = filtered.filter(p => parseFloat(p.stockQuantity) <= parseFloat(p.minStock));
    if (productType) filtered = filtered.filter(p => p.productType === productType);

    res.json(filtered.map(p => formatProduct(p)));
  } catch (err) {
    req.log.error({ err }, "list products error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/products", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { categoryId, name, barcode, productType = "simple", costPrice, salePrice, stockQuantity = 0, minStock = 0, unitType = "unidade", imageUrl, description, preparationInstructions, preparationTimeMinutes, internalNotes, active = true } = req.body;
    if (!name || salePrice === undefined) {
      res.status(400).json({ error: "name and salePrice are required" });
      return;
    }
    const [p] = await db.insert(productsTable).values({
      categoryId: categoryId || null,
      name, barcode: barcode || null,
      productType, costPrice: costPrice ? String(costPrice) : null,
      salePrice: String(salePrice),
      stockQuantity: String(stockQuantity), minStock: String(minStock),
      unitType, imageUrl: imageUrl || null, description: description || null,
      preparationInstructions: preparationInstructions || null,
      preparationTimeMinutes: preparationTimeMinutes || null,
      internalNotes: internalNotes || null, active,
    }).returning();

    if (p && parseFloat(String(stockQuantity)) > 0) {
      await db.insert(stockMovementsTable).values({
        productId: p.id, userId: req.user!.id, type: "entry",
        quantity: String(stockQuantity), previousQuantity: "0",
        newQuantity: String(stockQuantity), reason: "Estoque inicial",
      });
    }

    res.status(201).json(formatProduct(p!));
  } catch (err) {
    req.log.error({ err }, "create product error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/barcode/:barcode", requireAuth, async (req, res) => {
  try {
    const rows = await db
      .select({
        id: productsTable.id, categoryId: productsTable.categoryId, categoryName: categoriesTable.name,
        name: productsTable.name, barcode: productsTable.barcode, productType: productsTable.productType,
        costPrice: productsTable.costPrice, salePrice: productsTable.salePrice, marginPercentage: productsTable.marginPercentage,
        stockQuantity: productsTable.stockQuantity, minStock: productsTable.minStock, unitType: productsTable.unitType,
        imageUrl: productsTable.imageUrl, description: productsTable.description,
        preparationInstructions: productsTable.preparationInstructions, preparationTimeMinutes: productsTable.preparationTimeMinutes,
        internalNotes: productsTable.internalNotes, active: productsTable.active, createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(productsTable.barcode, req.params.barcode!), eq(productsTable.active, true)))
      .limit(1);

    if (!rows.length) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(formatProduct(rows[0]!));
  } catch (err) {
    req.log.error({ err }, "get product by barcode error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const rows = await db
      .select({
        id: productsTable.id, categoryId: productsTable.categoryId, categoryName: categoriesTable.name,
        name: productsTable.name, barcode: productsTable.barcode, productType: productsTable.productType,
        costPrice: productsTable.costPrice, salePrice: productsTable.salePrice, marginPercentage: productsTable.marginPercentage,
        stockQuantity: productsTable.stockQuantity, minStock: productsTable.minStock, unitType: productsTable.unitType,
        imageUrl: productsTable.imageUrl, description: productsTable.description,
        preparationInstructions: productsTable.preparationInstructions, preparationTimeMinutes: productsTable.preparationTimeMinutes,
        internalNotes: productsTable.internalNotes, active: productsTable.active, createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatProduct(rows[0]!));
  } catch (err) {
    req.log.error({ err }, "get product error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/products/:id", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const { categoryId, name, barcode, productType, costPrice, salePrice, stockQuantity, minStock, unitType, imageUrl, description, preparationInstructions, preparationTimeMinutes, internalNotes, active } = req.body;
    const [p] = await db.update(productsTable).set({
      ...(categoryId !== undefined && { categoryId }),
      ...(name && { name }),
      ...(barcode !== undefined && { barcode }),
      ...(productType && { productType }),
      ...(costPrice !== undefined && { costPrice: costPrice ? String(costPrice) : null }),
      ...(salePrice !== undefined && { salePrice: String(salePrice) }),
      ...(stockQuantity !== undefined && { stockQuantity: String(stockQuantity) }),
      ...(minStock !== undefined && { minStock: String(minStock) }),
      ...(unitType && { unitType }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(description !== undefined && { description }),
      ...(preparationInstructions !== undefined && { preparationInstructions }),
      ...(preparationTimeMinutes !== undefined && { preparationTimeMinutes }),
      ...(internalNotes !== undefined && { internalNotes }),
      ...(active !== undefined && { active }),
      updatedAt: new Date(),
    }).where(eq(productsTable.id, id)).returning();
    if (!p) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatProduct(p));
  } catch (err) {
    req.log.error({ err }, "update product error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/products/:id", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    await db.update(productsTable).set({ active: false, updatedAt: new Date() }).where(eq(productsTable.id, id));
    res.json({ message: "Product inactivated" });
  } catch (err) {
    req.log.error({ err }, "delete product error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/:id/composite-items", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const rows = await db
      .select({
        id: compositeProductItemsTable.id,
        compositeProductId: compositeProductItemsTable.compositeProductId,
        ingredientProductId: compositeProductItemsTable.ingredientProductId,
        ingredientName: productsTable.name,
        ingredientStock: productsTable.stockQuantity,
        quantityUsed: compositeProductItemsTable.quantityUsed,
        unitType: compositeProductItemsTable.unitType,
        notes: compositeProductItemsTable.notes,
      })
      .from(compositeProductItemsTable)
      .innerJoin(productsTable, eq(compositeProductItemsTable.ingredientProductId, productsTable.id))
      .where(eq(compositeProductItemsTable.compositeProductId, id));

    res.json(rows.map(r => ({
      ...r,
      ingredientStock: parseFloat(r.ingredientStock),
      quantityUsed: parseFloat(r.quantityUsed),
    })));
  } catch (err) {
    req.log.error({ err }, "get composite items error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/products/:id/composite-items", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const { items } = req.body;
    await db.delete(compositeProductItemsTable).where(eq(compositeProductItemsTable.compositeProductId, id));
    if (items && items.length > 0) {
      await db.insert(compositeProductItemsTable).values(
        items.map((item: any) => ({
          compositeProductId: id,
          ingredientProductId: item.ingredientProductId,
          quantityUsed: String(item.quantityUsed),
          unitType: item.unitType,
          notes: item.notes || null,
        }))
      );
    }
    const rows = await db
      .select({
        id: compositeProductItemsTable.id,
        compositeProductId: compositeProductItemsTable.compositeProductId,
        ingredientProductId: compositeProductItemsTable.ingredientProductId,
        ingredientName: productsTable.name,
        ingredientStock: productsTable.stockQuantity,
        quantityUsed: compositeProductItemsTable.quantityUsed,
        unitType: compositeProductItemsTable.unitType,
        notes: compositeProductItemsTable.notes,
      })
      .from(compositeProductItemsTable)
      .innerJoin(productsTable, eq(compositeProductItemsTable.ingredientProductId, productsTable.id))
      .where(eq(compositeProductItemsTable.compositeProductId, id));

    res.json(rows.map(r => ({ ...r, ingredientStock: parseFloat(r.ingredientStock), quantityUsed: parseFloat(r.quantityUsed) })));
  } catch (err) {
    req.log.error({ err }, "update composite items error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/:id/stock-history", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const rows = await db
      .select({
        id: stockMovementsTable.id,
        productId: stockMovementsTable.productId,
        productName: productsTable.name,
        userId: stockMovementsTable.userId,
        type: stockMovementsTable.type,
        quantity: stockMovementsTable.quantity,
        previousQuantity: stockMovementsTable.previousQuantity,
        newQuantity: stockMovementsTable.newQuantity,
        reason: stockMovementsTable.reason,
        createdAt: stockMovementsTable.createdAt,
      })
      .from(stockMovementsTable)
      .innerJoin(productsTable, eq(stockMovementsTable.productId, productsTable.id))
      .where(eq(stockMovementsTable.productId, id))
      .orderBy(sql`${stockMovementsTable.createdAt} desc`)
      .limit(50);

    res.json(rows.map(r => ({
      ...r,
      userName: "Sistema",
      quantity: parseFloat(r.quantity),
      previousQuantity: parseFloat(r.previousQuantity),
      newQuantity: parseFloat(r.newQuantity),
    })));
  } catch (err) {
    req.log.error({ err }, "get stock history error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
