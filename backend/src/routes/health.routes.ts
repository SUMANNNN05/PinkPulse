import { Router } from "express";
import { sendSuccess } from "../utils/ApiResponse";

const router = Router();

router.get("/", (req, res) => {
  sendSuccess(res, { uptime: process.uptime(), timestamp: Date.now() }, "OK");
});

export default router;
