import { Router } from "express";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/health", healthRoutes);

// Milestone 2 will add:
// router.use("/auth", authRoutes);
// Milestone 4 will add:
// router.use("/scans", scanRoutes);

export default router;
