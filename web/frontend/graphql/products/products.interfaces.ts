export interface I_ProductsGetDto {
  query?: string;
  sort: E_SORT_PRODUCTS | string;
  reverse: boolean;
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

export interface I_MutationProductDuplicate {
  productId: string;
  newTitle: string;
  newStatus: E_STATUS_PRODUCTS;
  copyImages: boolean;
}

export interface I_MutationProductArchive {
  product: {
    id: string;
    status: E_STATUS_PRODUCTS;
  };
}

export interface I_MutationProductUpdate {
  product: {
    id: string;
    status: E_STATUS_PRODUCTS;
    title: string;
    descriptionHtml: string;
  };
}

export interface I_MutationProductCreate {
  product: {
    status: E_STATUS_PRODUCTS;
    title: string;
    descriptionHtml: string;
  };
}

export interface I_MutationProductDelete {
  product: {
    id: string;
  };
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
  active = "ACTIVE",
  archived = "ARCHIVED",
}
