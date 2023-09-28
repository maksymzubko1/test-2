import { sendRequest, T_Fetch } from "../../utils/sendRequest";
import { I_Default } from "../../graphql/default.interface";
import { I_OrdersGetDto } from "../../graphql/orders/orders.interfaces";
import {
  GET_ORDER,
  GET_ORDERS_QUERY,
} from "../../graphql/orders/orders.graphql";

export async function queryOrdersGet(fetch: T_Fetch, data: I_OrdersGetDto) {
  const body = {
    query: GET_ORDERS_QUERY,
    params: data,
  } as I_Default<I_OrdersGetDto>;
  return await sendRequest(fetch, JSON.stringify(body));
}

export async function queryOrderGet(fetch: T_Fetch, id: number) {
  const body = {
    query: GET_ORDER,
    params: { id: `gid://shopify/Order/${id}` },
  } as I_Default<{ id: string }>;
  return await sendRequest(fetch, JSON.stringify(body));
}
