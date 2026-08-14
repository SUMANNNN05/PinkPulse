import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import scanRoutes from "./scan.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/scans", scanRoutes);

export default router;
