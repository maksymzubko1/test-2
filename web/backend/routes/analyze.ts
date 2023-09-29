import express from "express";
import {saveAnalyzeProduct} from "../services/analyze-services";

const analyzeRoute = express.Router();

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

export default analyzeRoute;
