export interface I_OrdersGetDto{
    query?: string
    sort: E_SORT | string,
    reverse: boolean
    first: number,
    after?: string
    before?: string
}

export enum E_STATUS {
    PENDING = "pending",
    AUTHORIZED = "authorized",
    PARTIALLY_PAID = "partially_paid",
    PARTIALLY_REFUNDED = "partially_refunded",
    VOIDED = "voided",
    PAID = "paid",
    REFUNDED = "refunded",
    EXPIRED = "expired",
}

export enum E_ALL_STATUSES {
    PENDING = "pending",
    AUTHORIZED = "authorized",
    PARTIALLY_PAID = "partially_paid",
    PARTIALLY_REFUNDED = "partially_refunded",
    VOIDED = "voided",
    PAID = "paid",
    REFUNDED = "refunded",
    EXPIRED = "expired",
    FULFILLED = "fulfilled",
    UNFULFILLED = "unfulfilled",
    PARTIALLY_FULFILLED = "partially_fulfilled",
    SCHEDULED = "scheduled",
    ON_HOLD = "on_hold"
}

export enum E_SORT {
    createdAt = "CREATED_AT",
    amount = "TOTAL_PRICE",
    subtotalLineItemsQuantity = "TOTAL_ITEMS_QUANTITY"
}







