import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import productsRouter from "./products.js";
import salesRouter from "./sales.js";
import stockRouter from "./stock.js";
import cashRouter from "./cash.js";
import dashboardRouter from "./dashboard.js";
import usersRouter from "./users.js";
import reportsRouter from "./reports.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(salesRouter);
router.use(stockRouter);
router.use(cashRouter);
router.use(dashboardRouter);
router.use(usersRouter);
router.use(reportsRouter);

export default router;
