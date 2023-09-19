import { type Session, GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify";
import {I_OrdersGetDto} from "./dto/orders-get.dto";

const GET_ORDERS_QUERY = `
 query getOrders($sort:OrderSortKeys!, $query_:String, $lastCursor:String, $first: Int!) {
    orders(sortKey: $sort, query: $query_, after: $lastCursor, first: $first) {
      nodes{
          id
          name
          displayAddress {
            id
            formatted
          }
          displayFinancialStatus
          subtotalLineItemsQuantity
          totalPrice
          createdAt
          updatedAt
          tags
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const GET_ORDER_QUERY = `
 query getOrders($sort:OrderSortKeys!, $query_:String, $lastCursor:String, $first: Int!) {
    orders(sortKey: $sort, query: $query_, after: $lastCursor, first: $first) {
      nodes{
          id
          name
          displayAddress {
            id
            formatted
          }
          displayFinancialStatus
          subtotalLineItemsQuantity
          totalPrice
          createdAt
          updatedAt
          tags
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export async function getOrders(
    session: Session,
    params: I_OrdersGetDto,
) {
  const client = new shopify.api.clients.Graphql({ session });

  const _params = generateDtoObject(params);

  try {
      return (await client.query({
        data: {
          query: GET_ORDERS_QUERY,
          variables: {
            ..._params
          },
        },
      })).body;
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
          `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}

const generateDtoObject = (obj: I_OrdersGetDto) => {
  let _params: any = {first: Number(obj.take), sort: obj.sort};
  if('query' in obj){
    let strArray: string[] = [];

    const title = obj?.query?.title;
    const startDate = obj?.query?.startDate;
    const endDate = obj?.query?.endDate;
    const status = obj?.query?.status;

    if(title)
      strArray.push(`title: ${title}`);
    if(startDate)
      strArray.push(`createdAt:>=${startDate.toString()}`)
    if(endDate)
      strArray.push(`createdAt:<=${endDate.toString()}`)
    if(status)
      strArray.push(`status:${status}`)

    _params['query'] = strArray.join(' ');
  }

  if('last_cursor' in obj)
    _params['lastCursor'] = obj.last_cursor;

  return _params;
}
