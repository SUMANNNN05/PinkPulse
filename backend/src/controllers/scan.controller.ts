import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import * as scanService from "../services/scan.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const scan = await scanService.createScan(req.user!.id, req.file!);
  sendSuccess(res, { scan }, "Scan processed", 201);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const result = await scanService.listScans(req.user!.id, page, limit);
  sendSuccess(res, result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const scan = await scanService.getScanById(req.user!.id, req.params.id as string);
  sendSuccess(res, { scan });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await scanService.deleteScan(req.user!.id, req.params.id as string);
  sendSuccess(res, null, "Scan deleted");
});
