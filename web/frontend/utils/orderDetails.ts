import { shopifyIdToNumber } from "./shopifyIdToNumber";

export function getOrderDetails(order: any) {
  if (!order) return {};

  const orderItems = order?.lineItems?.nodes;

  const totalCount =
    orderItems?.reduce(
      (accumulator: number, currentValue: any) =>
        accumulator + currentValue.quantity,
      0
    ) ?? 0;
  const totalSum =
    orderItems?.reduce(
      (accumulator: number, currentValue: any) =>
        accumulator +
        parseFloat(currentValue?.originalTotalSet?.shopMoney?.amount),
      0
    ) ?? 0;

  const lineItemsQuantity = order?.currentSubtotalLineItemsQuantity;
  const fulfillmentStatus = order?.displayFulfillmentStatus;
  const financialStatus = order?.displayFinancialStatus;
  const discount = order?.totalDiscountsSet?.shopData?.amount ?? "0.0";
  const currencyCode = order?.currencyCode;
  const totalWeight = parseInt(order?.totalWeight) ?? 0;
  const shippingLine = order?.shippingLine
    ? {
        title: order?.shippingLine?.title ?? "",
        price:
          order?.shippingLine?.originalPriceSet?.shopMoney?.amount ?? "0.0",
      }
    : null;
  const tax =
    order?.currentTaxLines && order?.currentTaxLines?.length > 0
      ? {
          title: order?.currentTaxLines[0]?.title,
          rate: order?.currentTaxLines[0]?.ratePercentage,
          included: !!order?.taxesIncluded,
          price:
            order?.currentTaxLines[0]?.priceSet?.shopMoney?.amount ?? "0.0",
        }
      : null;
  const totalPrice = order.totalPriceSet?.shopMoney?.amount ?? "0.0";
  const note = order?.note ?? "";
  const customer = order?.customer
    ? {
        id: shopifyIdToNumber(order.customer.id),
        displayName: order.customer.displayName ?? "",
        email: order.customer?.email,
        phone: order.customer?.phone,
      }
    : null;
  const shippingAddress =
    order?.shippingAddress && order?.shippingAddress?.formatted
      ? order.shippingAddress.formatted
      : [];
  const billingAddress =
    order?.billingAddress && order?.billingAddress?.formatted
      ? order.billingAddress.formatted
      : [];
  const billingAddressMatchesShippingAddress =
    !!order?.billingAddressMatchesShippingAddress;
  const id = shopifyIdToNumber(order.id) ?? null;
  const customerPaid = order?.transactions
    ? order?.transactions?.reduce(
        (accumulator: number, currentValue: any) =>
          accumulator + parseFloat(currentValue?.amountSet?.shopMoney?.amount),
        0
      ) ?? 0
    : "0.0";

  return {
    orderItems,
    totalCount,
    totalSum,
    lineItemsQuantity,
    fulfillmentStatus,
    financialStatus,
    discount,
    currencyCode,
    totalWeight,
    shippingLine,
    tax,
    totalPrice,
    note,
    customer,
    shippingAddress,
    billingAddress,
    billingAddressMatchesShippingAddress,
    id,
    customerPaid,
  };
}
