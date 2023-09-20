export interface I_OrdersGetDto{
    query?: string
    sort: E_SORT | string,
    reverse: boolean
    first: number,
    after?: string
    before?: string
}

export enum E_STATUS {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
    DRAFT = "DRAFT"
}

export enum E_SORT {
    createdAt = "CREATED_AT",
    amount = "TOTAL_PRICE",
    subtotalLineItemsQuantity = "TOTAL_ITEMS_QUANTITY"
}