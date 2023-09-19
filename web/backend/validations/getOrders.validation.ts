import {query} from "express-validator";

export enum E_STATUS {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
    DRAFT = "DRAFT"
}

export enum E_SORT {
    createdAt = "createdAt",
    amount = "TOTAL_PRICE",
    subtotalLineItemsQuantity = "TOTAL_ITEMS_QUANTITY"
}
// {title?: string, startDate?: Date, endDate?: Date, status?: E_STATUS }
export default [
    query('take').isInt({max: 40, min: 10}),
    query('sort').isIn([E_SORT.subtotalLineItemsQuantity, E_SORT.createdAt, E_SORT.amount]),
    // query('query').optional().custom(validator=>{
    //     console.log(validator)
    //     return false
    // }),
    query('last_cursor').optional().isString()
]