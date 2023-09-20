export const GET_ORDERS_QUERY = `
 query getOrders($sort:OrderSortKeys!, $query:String, $lastCursor:String, $first: Int!, $reverse:Boolean) {
    orders(sortKey: $sort, query: $query, after: $lastCursor, first: $first, reverse: $reverse) {
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
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_ORDERS_TOP5 = `
 query getOrdersTop {
    orders(sortKey: TOTAL_PRICE, first: 5, reverse: true) {
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