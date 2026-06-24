import type {
  Request,
  Response
} from "express";

import {
  getNews,
  searchStocks
} from "../services/finnhub.service.ts";

export async function getMarketNews(
  req: Request,
  res: Response
) {
  try {
    const symbols =
      req.query.symbols
        ?.toString()
        .split(",");

    const news =
      await getNews(
        symbols
      );

    res.json(news);

  } catch {
    res
      .status(500)
      .json({
        error:
          "Failed to get news",
      });
  }
}

export async function searchStock(
  req: Request,
  res: Response
) {
  try {
    const query =
      req.query.q?.toString();

    const results =
      await searchStocks(
        query
      );

    res.json(
      results
    );

  } catch {
    res
      .status(500)
      .json({
        error:
          "Search failed",
      });
  }
}
