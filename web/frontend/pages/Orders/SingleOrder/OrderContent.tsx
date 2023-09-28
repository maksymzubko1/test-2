import React, { useCallback, useId } from "react";
import { getOrderDetails } from "../../../utils/orderDetails";
import {
  Badge,
  Box,
  Button,
  Grid,
  HorizontalStack,
  Image,
  LegacyCard,
  Link,
  Text,
  VerticalStack,
} from "@shopify/polaris";
import { CustomBadge } from "../../../components/CustomBadge/CustomBadge";
import { DEFAULT_IMAGE, DEFAULT_URL } from "../../../constants/constants";
import { ViewMinor } from "@shopify/polaris-icons";
import moment from "moment";
import { useShop } from "../../../hooks";
import { openNewTab } from "../../../utils/openNewTab";
import { shopifyIdToNumber } from "../../../utils/shopifyIdToNumber";

interface I_Props {
  order: any;
}
export const OrderContent = ({ order }: I_Props) => {
  const { state } = useShop();

  const DEFAULT_URL_SHOP = `${DEFAULT_URL}/${state.shop.replace(
    ".myshopify.com",
    ""
  )}`;

  const handleClick = useCallback(() => {
    openNewTab(`${DEFAULT_URL_SHOP}/orders/${id}`);
  }, [state]);

  const {
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
  } = getOrderDetails(order);

  const OrderDetails = () => {
    return (
      <LegacyCard>
        <LegacyCard.Section>
          <CustomBadge status={fulfillmentStatus} variant={"large"} />
          <VerticalStack gap={"2"} align={"center"}>
            {orderItems?.map((i: any) => {
              const price = i.originalUnitPriceSet.shopMoney.amount;
              const money = i.originalTotalSet.shopMoney;
              const product_id = shopifyIdToNumber(i.product?.id);
              const key = useId();

              return (
                <Grid
                  key={`order-item-grid-${key}`}
                  columns={{ xl: 12, lg: 12, md: 6, sm: 6 }}
                >
                  <Grid.Cell columnSpan={{ xl: 9, lg: 9, md: 4, sm: 4 }}>
                    <HorizontalStack gap={"2"} blockAlign={"center"}>
                      <Image
                        width={"80px"}
                        alt={"product-img"}
                        source={order.image?.url ?? DEFAULT_IMAGE}
                      />
                      <Text as={"p"} variant={"bodyLg"}>
                        {isNaN(product_id) ? (
                          i.title
                        ) : (
                          <Link
                            url={`${DEFAULT_URL_SHOP}/products/${product_id}`}
                            target={"_blank"}
                          >
                            {i.title}
                          </Link>
                        )}
                      </Text>
                    </HorizontalStack>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 2, sm: 2 }}>
                    <Box minHeight={"100%"} aria-details={"order-info-details"}>
                      <HorizontalStack
                        gap={"10"}
                        align={"space-between"}
                        blockAlign={"center"}
                      >
                        <Text as={"p"}>
                          {`${order.currencyCode} ${price} × ${i.quantity}`}
                        </Text>
                        <Text as={"p"}>
                          {`${order.currencyCode} ${money.amount}`}
                        </Text>
                      </HorizontalStack>
                    </Box>
                  </Grid.Cell>
                </Grid>
              );
            })}
            {totalCount !== lineItemsQuantity && (
              <Text
                alignment={"center"}
                color={"subdued"}
                variant={"bodyLg"}
                as={"p"}
              >
                <Link
                  url={`${DEFAULT_URL_SHOP}/orders/${id}`}
                  target={"_blank"}
                >
                  more...
                </Link>
              </Text>
            )}
          </VerticalStack>
        </LegacyCard.Section>
      </LegacyCard>
    );
  };

  const PaymentDetails = () => {
    return (
      <LegacyCard>
        <LegacyCard.Section>
          <VerticalStack gap={"4"}>
            <CustomBadge status={financialStatus} variant={"large"} />
            <Grid columns={{ xl: 12, lg: 12, md: 6, sm: 6 }}>
              {/*Subtotal*/}
              <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 1, sm: 1 }}>
                <Text as={"p"} variant={"bodyLg"}>
                  Subtotal
                </Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 1, sm: 1 }}>
                <Text as={"p"} variant={"bodyLg"}>
                  {totalCount} item{totalCount !== 0 ? "s" : ""}
                </Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xl: 6, lg: 6, md: 4, sm: 4 }}>
                <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
                  {`${order.currencyCode} ${totalSum.toFixed(2)}`}
                </Text>
              </Grid.Cell>
              {/*Discount*/}
              {discount !== "0.0" && (
                <>
                  <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 2, sm: 2 }}>
                    <Text as={"p"} variant={"bodyLg"}>
                      Discount
                    </Text>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xl: 9, lg: 9, md: 4, sm: 4 }}>
                    <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
                      {`${currencyCode} -${discount}`}
                    </Text>
                  </Grid.Cell>
                </>
              )}
              {/*Shipping*/}
              {shippingLine && (
                <>
                  <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 1, sm: 1 }}>
                    <Text as={"p"} variant={"bodyLg"}>
                      Shipping
                    </Text>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 1, sm: 1 }}>
                    <Text as={"p"} variant={"bodyLg"}>
                      {shippingLine.title} ({totalWeight / 1000} kg)
                    </Text>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xl: 6, lg: 6, md: 4, sm: 4 }}>
                    <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
                      {`${currencyCode} ${shippingLine.price}`}
                    </Text>
                  </Grid.Cell>
                </>
              )}
              {/*Tax*/}
              {tax && (
                <>
                  <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 1, sm: 1 }}>
                    <Text as={"p"} variant={"bodyLg"}>
                      Tax
                    </Text>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 1, sm: 1 }}>
                    <Text as={"p"} variant={"bodyLg"}>
                      {tax.title} {tax.rate}% {tax.included && "(Included)"}
                    </Text>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xl: 6, lg: 6, md: 4, sm: 4 }}>
                    <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
                      {`${currencyCode} ${tax.price}`}
                    </Text>
                  </Grid.Cell>
                </>
              )}
              {/*Total*/}
              <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 2, sm: 2 }}>
                <Text as={"p"} fontWeight={"bold"} variant={"bodyLg"}>
                  Total
                </Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xl: 9, lg: 9, md: 4, sm: 4 }}>
                <Text
                  fontWeight={"bold"}
                  alignment={"end"}
                  as={"p"}
                  variant={"bodyLg"}
                >
                  {`${currencyCode} ${totalPrice}`}
                </Text>
              </Grid.Cell>
            </Grid>
          </VerticalStack>
        </LegacyCard.Section>
        <LegacyCard.Section>
          <HorizontalStack blockAlign={"center"} align={"space-between"}>
            <Text as={"p"} variant={"bodyLg"}>
              Paid by customer
            </Text>
            <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
              {`${currencyCode} ${customerPaid.toFixed(2)}`}
            </Text>
          </HorizontalStack>
        </LegacyCard.Section>
      </LegacyCard>
    );
  };

  const Notes = () => {
    return (
      <LegacyCard title={"Notes"}>
        <LegacyCard.Section>
          {note.length ? (
            <Text as={"p"} variant={"bodyMd"}>
              {note}
            </Text>
          ) : (
            <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
              Empty
            </Text>
          )}
        </LegacyCard.Section>
      </LegacyCard>
    );
  };

  const Customer = () => {
    return customer ? (
      <>
        <LegacyCard.Section title={"Customer"}>
          <Text as={"p"} variant={"bodyLg"}>
            <Link
              url={`${DEFAULT_URL_SHOP}/customers/${customer.id}`}
              target={"_blank"}
            >
              {customer.displayName}
            </Link>
          </Text>
        </LegacyCard.Section>
        <LegacyCard.Section title={"CONTACT INFORMATION"}>
          {customer.email ? (
            <Text as={"p"} variant={"bodyLg"}>
              {customer.email}
            </Text>
          ) : (
            <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
              No email
            </Text>
          )}
          {customer.phone ? (
            <Text as={"p"} variant={"bodyLg"}>
              {customer.phone}
            </Text>
          ) : (
            <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
              No phone number
            </Text>
          )}
        </LegacyCard.Section>
      </>
    ) : (
      <LegacyCard.Section title={"Customer"}>
        <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
          Empty
        </Text>
      </LegacyCard.Section>
    );
  };

  const Shipping = () => {
    return (
      <LegacyCard.Section title={"SHIPPING ADDRESS"}>
        <VerticalStack gap={"1"}>
          {shippingAddress.length ? (
            shippingAddress.map((o: string, index: number) => (
              <Text
                key={`shipping-text-${o}${index}`}
                as={"p"}
                variant={"bodyLg"}
              >
                {o}
              </Text>
            ))
          ) : (
            <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
              Empty
            </Text>
          )}
        </VerticalStack>
      </LegacyCard.Section>
    );
  };

  const Billing = () => {
    return (
      <LegacyCard.Section title={"BILLING ADDRESS"}>
        <VerticalStack gap={"1"}>
          {billingAddressMatchesShippingAddress ? (
            <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
              Same as shipping address
            </Text>
          ) : billingAddress.length ? (
            billingAddress.map((o: string, index: number) => (
              <Text
                key={`billing-text-${o}${index}`}
                as={"p"}
                variant={"bodyLg"}
              >
                {o}
              </Text>
            ))
          ) : (
            <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
              Empty
            </Text>
          )}
        </VerticalStack>
      </LegacyCard.Section>
    );
  };

  const OrderInformation = () => {
    return (
      <LegacyCard>
        <Customer />
        <Shipping />
        <Billing />
      </LegacyCard>
    );
  };

  const Tags = () => {
    return (
      <LegacyCard title={"Tags"}>
        <LegacyCard.Section>
          <HorizontalStack gap={"2"} wrap>
            {order.tags && order.tags.length ? (
              order.tags.map((o: string) => (
                <Badge key={`tags-badge-${o}`} status={"enabled-experimental"}>
                  {o}
                </Badge>
              ))
            ) : (
              <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                Empty
              </Text>
            )}
          </HorizontalStack>
        </LegacyCard.Section>
      </LegacyCard>
    );
  };

  return (
    <VerticalStack gap={"4"} align={"center"}>
      <VerticalStack gap={"2"}>
        <HorizontalStack align={"space-between"} blockAlign={"center"}>
          <HorizontalStack blockAlign={"center"} gap={"3"}>
            <Text as={"h1"} variant={"heading4xl"}>
              Order {order.name}
            </Text>
            <CustomBadge
              status={order.displayFinancialStatus}
              variant={"slim"}
            />
            <CustomBadge
              status={order.displayFulfillmentStatus}
              variant={"slim"}
            />
          </HorizontalStack>
          <Button onClick={handleClick} size={"medium"} icon={ViewMinor}>
            View
          </Button>
        </HorizontalStack>
        <Text as={"h4"} color={"subdued"}>
          {moment(order.createdAt).format("MMM DD, YYYY hh:mm")}
        </Text>
      </VerticalStack>
      <Grid columns={{ xl: 12, lg: 12, md: 6, sm: 6 }}>
        <Grid.Cell columnSpan={{ xl: 9, lg: 9, md: 4, sm: 4 }}>
          <VerticalStack gap={"3"} align={"center"}>
            <OrderDetails />
            <PaymentDetails />
          </VerticalStack>
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xl: 3, lg: 3, md: 2, sm: 2 }}>
          <VerticalStack gap={"3"}>
            <Notes />
            <OrderInformation />
            <Tags />
          </VerticalStack>
        </Grid.Cell>
      </Grid>
    </VerticalStack>
  );
};
