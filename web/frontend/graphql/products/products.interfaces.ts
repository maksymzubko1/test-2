export interface I_ProductsGetDto {
  query?: string;
  sort: E_SORT_PRODUCTS | string;
  reverse: boolean;
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

export enum E_SORT_PRODUCTS {
  vendor = "VENDOR",
  title = "TITLE",
  createdAt = "CREATED_AT",
  updatedAt = "UPDATED_AT",
  inventory = "INVENTORY_TOTAL",
  productType = "PRODUCT_TYPE",
}

export enum E_STATUS_PRODUCTS {
  draft = "DRAFT",
  active = "ACTIVE"
}