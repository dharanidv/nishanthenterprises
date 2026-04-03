import type { Request, Response } from "express";
import * as catalogSummaryService from "../services/catalogSummary.service";

export async function getDashboardSummary(_req: Request, res: Response) {
  const data = await catalogSummaryService.getCatalogDashboardSummary();
  res.status(200).json({ success: true, data });
}
