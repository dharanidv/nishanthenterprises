import type { Request, Response } from "express";
import * as publicContentService from "../services/publicContent.service";

export async function getHomeContents(_req: Request, res: Response) {
  const data = await publicContentService.getHomeContents();
  res.status(200).json({
    success: true,
    data,
    count: data.sections.length
  });
}

