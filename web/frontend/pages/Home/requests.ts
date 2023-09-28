import { sendRequest, T_Fetch } from "../../utils/sendRequest";
import { I_Default } from "../../graphql/default.interface";
import {
  E_SORT_ORDERS,
  I_OrdersGetDto,
} from "../../graphql/orders/orders.interfaces";
import {
  GET_ORDERS_QUERY,
  GET_ORDERS_TOP5,
} from "../../graphql/orders/orders.graphql";

export async function queryTop5OrdersGet(fetch: T_Fetch) {
  const body = {
    query: GET_ORDERS_TOP5,
  } as I_Default<I_OrdersGetDto>;
  return (
    (await sendRequest(fetch, JSON.stringify(body)))?.data?.orders?.nodes ?? []
  );
}

export async function queryOrdersMonthGet(fetch: T_Fetch) {
  const nowDate = new Date();
  const body = {
    query: GET_ORDERS_QUERY,
    params: {
      sort: E_SORT_ORDERS.createdAt,
      first: 50,
      query: `createdAt:=${nowDate.getFullYear()}-${nowDate.getMonth()}`,
    },
  } as I_Default<I_OrdersGetDto>;
  return (
    (await sendRequest(fetch, JSON.stringify(body)))?.data?.orders?.nodes ?? []
  );
}
