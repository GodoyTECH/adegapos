import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/categories", requireAuth, async (req, res) => {
  try {
    const { active } = req.query;
    let query = db.select().from(categoriesTable);
    const cats = await query;
    const filtered = active !== undefined
      ? cats.filter(c => c.active === (active === "true"))
      : cats;
    res.json(filtered.map(c => ({
      id: c.id, name: c.name, description: c.description, active: c.active, createdAt: c.createdAt
    })));
  } catch (err) {
    req.log.error({ err }, "list categories error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/categories", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { name, description, active = true } = req.body;
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const [cat] = await db.insert(categoriesTable).values({ name, description, active }).returning();
    res.status(201).json({ id: cat!.id, name: cat!.name, description: cat!.description, active: cat!.active, createdAt: cat!.createdAt });
  } catch (err) {
    req.log.error({ err }, "create category error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/categories/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (!cat) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: cat.id, name: cat.name, description: cat.description, active: cat.active, createdAt: cat.createdAt });
  } catch (err) {
    req.log.error({ err }, "get category error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/categories/:id", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const { name, description, active } = req.body;
    const [cat] = await db.update(categoriesTable)
      .set({ name, description, ...(active !== undefined && { active }), updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!cat) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: cat.id, name: cat.name, description: cat.description, active: cat.active, createdAt: cat.createdAt });
  } catch (err) {
    req.log.error({ err }, "update category error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/categories/:id", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    await db.update(categoriesTable).set({ active: false, updatedAt: new Date() }).where(eq(categoriesTable.id, id));
    res.json({ message: "Category inactivated" });
  } catch (err) {
    req.log.error({ err }, "delete category error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
