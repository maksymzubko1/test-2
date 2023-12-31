import type { Session } from "@shopify/shopify-api";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import expressServeStaticGzip from "express-static-gzip";
import { readFileSync } from "fs";
import { join } from "path";
import shopify from "./shopify";

// Import Middleware
import updateShopDataMiddleware from "./middleware/shopData";

// Import Webhooks
import GDPRWebhookHandlers from "./webhooks/gdpr";
import addUninstallWebhookHandler from "./webhooks/uninstall";

// Import Routes
import billingRoutes, {
  billingUnauthenticatedRoutes,
} from "./routes/billing/index";
import blockRoutes from "./routes/blocks";
import shopRoutes from "./routes/shop";
import graphqlRoute from "./routes/graphql";
import {analyzeRoute, analyzeRouteProtected} from "./routes/analyze";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "8081",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/../frontend/dist`
    : `${process.cwd()}/../frontend`;

const app = express();

// Set up Shopify authentication
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  updateShopDataMiddleware(app),
  shopify.redirectToShopifyOrAppRoot()
);

// Set up Shopify webhooks handling
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);
await addUninstallWebhookHandler();

app.use(express.json());

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/client/vite.config.js

// Unauthenticated routes
app.use("/api/billing", billingUnauthenticatedRoutes);
app.use("/api/analyze", analyzeRoute);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

// Print all requested paths
app.use("/*", (req: Request, res: Response, next: NextFunction) => {
  const shop = req.query.shop;
  if (shop) {
    console.log("-->", req.baseUrl + req.path, "| { shop: " + shop + " }");
  }
  return next();
});

app.use("/api/*", (req: Request, res: Response, next: NextFunction) => {
  const session: Session = res.locals?.shopify?.session;
  const shop = session?.shop;
  console.log("-->", req.baseUrl + req.path, "| { shop: " + shop + " }");
  return next();
});

app.use("/api/block", blockRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/graphql", graphqlRoute);
app.use("/api/analyze", analyzeRouteProtected);

app.use(shopify.cspHeaders());
app.use(
  expressServeStaticGzip(STATIC_PATH, {
    enableBrotli: true,
    index: false,
    orderPreference: ["br", "gz"],
  })
);

// Reply to health check to let server know we are ready
app.use("/health", (_req, res) => {
  res.status(200).send();
});

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
console.log(`App running on port: ${PORT} ...`);
