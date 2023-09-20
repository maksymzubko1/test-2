import express from "express";
import {sendReq} from "../services/graphql-services";

const graphqlRoute = express.Router();

graphqlRoute.post("/", async (_req, res) => {
    try {
        const {params, query} = _req.body;
        console.log(params, query)
        const orders = await sendReq(res.locals.shopify.session, params, query);
        // console.log('orders', orders)
        res.status(200).send(orders);
    } catch (e) {
        console.log(`Failed to process: ${(e as Error).message}`);
        res.status(500).send((e as Error).message);
    }
});

export default graphqlRoute;
