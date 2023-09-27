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

export const GET_PRODUCT = `
query getProduct($id:ID!){
  product(id: $id) {
    id
    title
    description
    descriptionHtml
    onlineStorePreviewUrl
    status
    featuredImage {
      url
    }
  }
}`

export const DUPLICATE_PRODUCT = `
mutation duplicateProduct($productId:ID!, $newTitle: String!, $newStatus:ProductStatus, $copyImages: Boolean){
  productDuplicate(productId: $productId, newTitle: $newTitle, newStatus: $newStatus, includeImages: $copyImages){
    newProduct{
      id
    }
    userErrors{
      field
      message
    }
  }
}`

export const ARCHIVE_PRODUCT = `
mutation archiveProduct($product:ProductInput!){
  productUpdate(input:$product){
    product{
      id
    }
    userErrors{
      field
      message
    }
  }
}`

export const DELETE_PRODUCT = `
mutation deleteProduct($product:ProductDeleteInput!){
  productDelete(input:$product){
    deletedProductId
    userErrors{
      field
      message
    }
  }
}`