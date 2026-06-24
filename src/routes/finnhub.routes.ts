import {
  Router
} from "express";

import {
  getMarketNews,
  searchStock
} from "../controllers/finnhub.controller.ts";

const router =
  Router();

router.get(
  "/news",
  getMarketNews
);

router.get(
  "/search",
  searchStock
);

export default router;
