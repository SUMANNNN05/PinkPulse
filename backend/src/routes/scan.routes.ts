import { Router } from "express";
import * as scanController from "../controllers/scan.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { uploadScanImage } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import { scanIdParamSchema } from "../validators/scan.validator";

const router = Router();

router.use(requireAuth);

router.post("/", uploadScanImage, scanController.create);
router.get("/", scanController.list);
router.get("/:id", validate(scanIdParamSchema), scanController.getById);
router.delete("/:id", validate(scanIdParamSchema), scanController.remove);

export default router;
