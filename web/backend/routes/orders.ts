import shopify from "../shopify";
import express from "express";
import getOrdersValidation from "../validations/getOrders.validation";
import {validationResult} from "express-validator";
import {getOrders} from "../services/orders-services";
import {I_OrdersGetDto} from "../services/dto/orders-get.dto";

const ordersRoute = express.Router();

ordersRoute.get("/", ...getOrdersValidation, async (_req, res) => {
  const result = validationResult(_req);
  if(!result?.isEmpty())
  {
     return res.status(400).send(result.array())
  }
  try {
    // @ts-ignore
    const orders = (await getOrders(res.locals.shopify.session, {..._req.query} as I_OrdersGetDto))?.data ?? {};
    res.status(200).send(orders);
  } catch (e) {
    console.log(`Failed to process get orders: ${(e as Error).message}`);
    res.status(500).send((e as Error).message);
  }
});

export default ordersRoute;
