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

export const GET_ORDER = `
query getOrder($id: ID!) {
  order(id: $id) {
    id
    name
    note
    customer {
      id
      displayName
      email
      phone
    }
    shippingAddress{
      formatted
    }
    billingAddress{
      formatted
    }
    lineItems(first:10){
      nodes{
        id
        title
        image{
          url
        }
        product{
          id
        }
        originalUnitPriceSet{
          shopMoney{
            amount
            currencyCode
          }
        }
        originalTotalSet{
          shopMoney {
            amount
            currencyCode
          }
        }
        quantity
      }
    }
    billingAddressMatchesShippingAddress
    tags
    createdAt
    displayFulfillmentStatus
    displayFinancialStatus
    currencyCode
    taxesIncluded
    currentSubtotalLineItemsQuantity
    currentSubtotalPriceSet {
      shopMoney {
        amount
      }
    }
    totalDiscountsSet{
      shopMoney{
        amount
      }
    }
    totalWeight
    shippingLine {
      title
      originalPriceSet{
        shopMoney{
          amount
        }
      }
    }
    totalPriceSet {
      shopMoney {
        amount
      }
    }
    currentTaxLines {
      ratePercentage
      title
      priceSet {
        shopMoney {
          amount
        }
      }
    }
    unpaid
  }
}`