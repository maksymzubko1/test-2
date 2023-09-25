export const GET_PRODUCT_APPS = `query getApps(
  $sort: ProductSortKeys!
  $query: String
  $after: String
  $before: String
  $first: Int
  $last: Int
  $reverse: Boolean
) {
  products(
    sortKey: $sort
    query: $query
    after: $after
    before: $before
    first: $first
    last: $last
    reverse: $reverse
  ) {
    nodes {
      id
      channelPublications: resourcePublicationsV2(
        first: $first
        onlyPublished: false
        catalogType: APP
      ) {
        nodes {
          publishDate
          publication {
            id
            name
          }
        }
      }
    }
  }
}`

export const GET_PRODUCT_MARKETS = `query getMarkets(
  $sort: ProductSortKeys!
  $query: String
  $after: String
  $before: String
  $first: Int
  $last: Int
  $reverse: Boolean
) {
  products(
    sortKey: $sort
    query: $query
    after: $after
    before: $before
    first: $first
    last: $last
    reverse: $reverse
  ) {
    nodes {
      id
      channelPublications: resourcePublicationsV2(
        first: $first
        onlyPublished: false
        catalogType: MARKET
      ) {
        nodes {
          publishDate
          publication {
            id
            catalog {
              ... on MarketCatalog {
                markets(first: 1) {
                  nodes {
                    id
                    name
                    enabled
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`

export const GET_PRODUCTS = `query getProducts(
  $sort: ProductSortKeys!
  $query: String
  $after: String
  $before: String
  $first: Int
  $last: Int
  $reverse: Boolean
) {
  products(
    sortKey: $sort
    query: $query
    after: $after
    before: $before
    first: $first
    last: $last
    reverse: $reverse
  ) {
    nodes {
      id
      title
      status
      tracksInventory
      totalInventory
      totalVariants
      vendor
      tracksInventory
      productType
      onlineStorePreviewUrl
      featuredImage {
        url
      }
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}`