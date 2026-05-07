import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

function formatUser(u: any) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, createdAt: u.createdAt };
}

router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.name);
    res.json(users.map(formatUser));
  } catch (err) {
    req.log.error({ err }, "list users error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "name, email, password and role are required" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role }).returning();
    res.status(201).json(formatUser(user!));
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(400).json({ error: "Email already in use" });
      return;
    }
    req.log.error({ err }, "create user error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    const { name, email, password, role, active } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (active !== undefined) updates.active = active;
    if (password) updates.passwordHash = await bcrypt.hash(password, 12);
    updates.updatedAt = new Date();
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "update user error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id!);
    if (id === req.user!.id) {
      res.status(400).json({ error: "Cannot disable yourself" });
      return;
    }
    await db.update(usersTable).set({ active: false, updatedAt: new Date() }).where(eq(usersTable.id, id));
    res.json({ message: "User disabled" });
  } catch (err) {
    req.log.error({ err }, "disable user error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
