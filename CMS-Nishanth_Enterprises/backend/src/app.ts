import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import dbRoutes from "./routes/db.routes";
import healthRoutes from "./routes/health.routes";
import catalogSummaryRoutes from "./routes/catalogSummary.routes";
import categoriesRoutes from "./routes/categories.routes";
import subcategoriesRoutes from "./routes/subcategories.routes";
import pageImagesRoutes from "./routes/pageImages.routes";
import pageSectionsRoutes from "./routes/pageSections.routes";
import pagesRoutes from "./routes/pages.routes";
import productsRoutes from "./routes/products.routes";
import publicContentRoutes from "./routes/publicContent.routes";
import publicCatalogRoutes from "./routes/publicCatalog.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 204
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api", dbRoutes);

  // Allow CMS frontend (other origin/port) to display <img src=".../assets/...">.
  app.use(
    "/assets",
    (req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", env.corsOrigin);
      next();
    },
    express.static(env.assetsRoot, { fallthrough: true, index: false })
  );

  app.use("/api/pages", pagesRoutes);
  app.use("/api/page-sections", pageSectionsRoutes);
  app.use("/api/page-images", pageImagesRoutes);
  app.use("/api", publicContentRoutes);
  app.use("/api/public/catalog", publicCatalogRoutes);
  app.use("/api/catalog", catalogSummaryRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/subcategories", subcategoriesRoutes);
  app.use("/api/products", productsRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.path });
  });

  app.use(errorHandler);

  return app;
}

