import {E_SORT, E_STATUS} from "../../validations/getOrders.validation";

export interface I_OrdersGetDto{
    query?: {title?: string, startDate?: Date, endDate?: Date, status?: E_STATUS }
    sort: E_SORT,
    take: number,
    lastCursor?: string
}