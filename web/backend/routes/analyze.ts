import express from "express";
import {getAnalyzeByProduct, saveAnalyzeProduct} from "../services/analyze-services";
import {Session} from "@shopify/shopify-api";

export const analyzeRoute = express.Router();
export const analyzeRouteProtected = express.Router();

analyzeRoute.post("/", async (_req, res) => {
  try {
    const {shop, itemId, type, event} = _req.body;

    switch (type){
      case "product":
        await saveAnalyzeProduct(shop, itemId, event);
    }

    res.status(200).send({status: 'success', date: new Date()});
  } catch (e) {
    console.log(`Failed to process: ${(e as Error).message}`);
    res.status(500).send((e as Error).message);
  }
});

analyzeRouteProtected.get("/:productId", async (_req, res) => {
  try {
    const session: Session = res.locals?.shopify?.session;
    const shop = session?.shop;

    const {productId} = _req.params;

    const analyzeData = await getAnalyzeByProduct(shop, productId);

    res.status(200).send(analyzeData);
  } catch (e) {
    console.log(`Failed to process: ${(e as Error).message}`);
    res.status(500).send((e as Error).message);
  }
});

