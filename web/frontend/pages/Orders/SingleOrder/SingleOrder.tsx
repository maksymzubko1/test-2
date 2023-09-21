import React from 'react';
import {
    Badge,
    Box,
    Button,
    Grid,
    HorizontalStack,
    Image,
    LegacyCard,
    Link,
    Spinner,
    Text,
    VerticalStack
} from "@shopify/polaris";
import {useAuthenticatedFetch} from "../../../hooks";
import {useQuery} from "@tanstack/react-query";
import {GET_ORDER} from "../../../graphql/orders.graphql";
import {I_Default} from "../../../graphql/default.interface";
import {useToast} from "@shopify/app-bridge-react";
import {useLocation} from "react-router-dom";
import moment from "moment";
import './style.css';
import {
    MarkFulfilledMinor,
    MarkPaidMinor,
    PinMinor,
    PinUnfilledMinor,
    UnfulfilledMajor,
    ViewMinor
} from "@shopify/polaris-icons";
import {DEFAULT_IMAGE, DEFAULT_URL} from "../../../constants/constants";
import {capitalize} from "../../../utils/capitalize";
import {E_ALL_STATUSES} from "../../../graphql/orders.interfaces";
import {Progress, Status} from '@shopify/polaris/build/ts/src/components/Badge/types';
import {FinancialStatus} from "../../../components/FinancialStatus/FinancialStatus";

function useGetOrder(id: number) {
    const fetch = useAuthenticatedFetch();

    return useQuery([id], async () => {
        const body = {
            query: GET_ORDER,
            params: {id: `gid://shopify/Order/${id}`}
        } as I_Default<{ id: string }>;

        const res = await fetch("/api/graphql", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        // @ts-ignore
        return (await res.json()).body;
    });
}

function getStatusBadge(status: string): Status {
    switch (status.toLowerCase()) {
        case E_ALL_STATUSES.PAID:
            return "enabled-experimental"
        case E_ALL_STATUSES.EXPIRED:
            return "warning"
        case E_ALL_STATUSES.UNFULFILLED:
            return "attention"
        case E_ALL_STATUSES.FULFILLED:
            return "enabled-experimental"
        default:
            return "warning"
    }
}

function getIconBadge(status: string) {
    switch (status.toLowerCase()) {
        case E_ALL_STATUSES.FULFILLED:
            return MarkFulfilledMinor
        case E_ALL_STATUSES.UNFULFILLED:
            return UnfulfilledMajor
        case E_ALL_STATUSES.PAID:
            return MarkPaidMinor
        default:
            return PinMinor
    }
}

function getProgressBadge(status: string): Progress {
    switch (status.toLowerCase()) {
        case E_ALL_STATUSES.FULFILLED:
            return "complete"
        case E_ALL_STATUSES.PAID:
            return "complete"
        case E_ALL_STATUSES.PARTIALLY_PAID:
            return "partiallyComplete"
        case E_ALL_STATUSES.PARTIALLY_FULFILLED:
            return "partiallyComplete"
        default:
            return "incomplete"
    }
}

export const SingleOrder = () => {
    const location = useLocation();
    const id = parseInt(location.pathname.split('/').at(-1));

    if (isNaN(id))
        return <Box>Invalid id</Box>

    const {data, isLoading, isError} = useGetOrder(id)
    const {show: showToast} = useToast();

    if (isLoading)
        return <Spinner/>


    const handleClick = () => {
        const a = document.createElement('a')
        a.href = `${DEFAULT_URL}/orders/${id}`
        a.target = "_blank";
        a.click();
        a.remove();
    }

    if (isError || !data?.data?.order)
        return <Box>Can't fetch this order</Box>

    const {order} = data?.data;

    const totalCount =
        order?.lineItems?.nodes?.reduce((accumulator: number, currentValue: any) => accumulator + currentValue.quantity, 0) ?? 0;

    const OrderDetails = () => {
        return (
            <LegacyCard >
                <LegacyCard.Section>
                    <Box aria-details={"badge-icon-div"}>
                        {/*@ts-ignore*/}
                        <Badge icon={getIconBadge(order.displayFulfillmentStatus)} size={"large-experimental"}  status={getStatusBadge(order.displayFulfillmentStatus)}
                               progress={getProgressBadge(order.displayFulfillmentStatus)}>
                            {capitalize(order.displayFulfillmentStatus)}
                        </Badge>
                    </Box>
                    <VerticalStack gap={"2"} align={"center"}>
                        {order.lineItems?.nodes.map((i: any) => {
                            const price = i.originalUnitPriceSet.shopMoney.amount;
                            const money = i.originalTotalSet.shopMoney;
                            return (
                                <Grid columns={{xl: 12}}>
                                    <Grid.Cell columnSpan={{xl: 9}}>
                                        <HorizontalStack gap={"2"} blockAlign={"center"} >
                                            <Image width={"80px"} alt={"product-img"}
                                                   source={order.image?.url ?? DEFAULT_IMAGE}/>
                                            <Text as={"p"} variant={"bodyLg"}>
                                                <Link
                                                    url={`${DEFAULT_URL}/products/${i.product.id.split('/').at(-1)}`}
                                                    target={"_blank"}>{i.title}</Link>
                                            </Text>
                                        </HorizontalStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xl: 3}}>
                                                <HorizontalStack gap={"10"} align={"space-between"} blockAlign={"center"}>
                                                    <Box minHeight={"100%"}>
                                                    </Box>
                                                    <Text as={'p'}>
                                                        {`${order.currencyCode} ${price} × ${i.quantity}`}
                                                    </Text>
                                                    <Text as={'p'}>
                                                        {`${order.currencyCode} ${money.amount}`}
                                                    </Text>
                                                </HorizontalStack>
                                    </Grid.Cell>
                                </Grid>
                            )
                        })}
                        {totalCount !== order.currentSubtotalLineItemsQuantity &&
                            <Text alignment={"center"} color={"subdued"} variant={"bodyLg"} as={"p"}>
                                <Link url={`${DEFAULT_URL}/orders/${id}`} target={"_blank"}>
                                    more...
                                </Link>
                            </Text>}
                    </VerticalStack>
                </LegacyCard.Section>
            </LegacyCard>
        )
    }

    const PaymentDetails = () => {
        return (
            <LegacyCard>
                <LegacyCard.Section>
                    <VerticalStack gap={"4"}>
                        <Box aria-details={"badge-icon-div"}>
                            {/*@ts-ignore*/}
                            <Badge icon={getIconBadge(order.displayFinancialStatus)} size={"large-experimental"} status={getStatusBadge(order.displayFinancialStatus)}
                                   progress={getProgressBadge(order.displayFinancialStatus)}>
                                {capitalize(order.displayFinancialStatus)}
                            </Badge>
                        </Box>
                        <Grid columns={{xl: 12}}>
                            {/*Subtotal*/}
                            {order.currentSubtotalPriceSet && <>
                                <Grid.Cell columnSpan={{xl: 3}}>
                                    <Text as={"p"} variant={"bodyLg"}>
                                        Subtotal
                                    </Text>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{xl: 3}}>
                                    <Text as={"p"} variant={"bodyLg"}>
                                        {totalCount} item{totalCount !== 0 ? 's' : ''}
                                    </Text>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{xl: 6}}>
                                    <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
                                        {`${order.currencyCode} ${order.currentSubtotalPriceSet?.shopMoney?.amount}`}
                                    </Text>
                                </Grid.Cell>
                            </>}
                            {/*Shipping*/}
                            {order.shippingLine &&
                                <>
                                    <Grid.Cell columnSpan={{xl: 3}}>
                                        <Text as={"p"} variant={"bodyLg"}>
                                            Shipping
                                        </Text>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xl: 3}}>
                                        <Text as={"p"} variant={"bodyLg"}>
                                            {order.shippingLine.title} ({parseInt(order.totalWeight) / 1000} kg)
                                        </Text>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xl: 6}}>
                                        <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
                                            {`${order.currencyCode} ${order.shippingLine?.originalPriceSet?.shopMoney?.amount}`}
                                        </Text>
                                    </Grid.Cell>
                                </>
                            }
                            {/*Tax*/}
                            {order?.currentTaxLines?.length > 0 && <>
                                <Grid.Cell columnSpan={{xl: 3}}>
                                    <Text as={"p"} variant={"bodyLg"}>
                                        Tax
                                    </Text>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{xl: 3}}>
                                    <Text as={"p"} variant={"bodyLg"}>
                                        {order.currentTaxLines[0]?.title} {order.currentTaxLines[0]?.ratePercentage}% {order.taxesIncluded && "(Included)"}
                                    </Text>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{xl: 6}}>
                                    <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
                                        {`${order?.currencyCode} ${order.currentTaxLines[0]?.priceSet?.shopMoney?.amount}`}
                                    </Text>
                                </Grid.Cell>
                            </>}
                            {/*Discount*/}
                            {(order?.totalDiscountsSet && order.totalDiscountsSet?.shopMoney?.amount !== '0.0') && <>
                                <Grid.Cell columnSpan={{xl: 3}}>
                                    <Text as={"p"} variant={"bodyLg"}>
                                        Discount
                                    </Text>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{xl: 9}}>
                                    <Text alignment={"end"} as={"p"} variant={"bodyLg"}>
                                        {`${order?.currencyCode} -${order.totalDiscountsSet?.shopMoney?.amount}`}
                                    </Text>
                                </Grid.Cell>
                            </>}
                            {/*Total*/}
                            {order?.totalPriceSet && <>
                                <Grid.Cell columnSpan={{xl: 3}}>
                                    <Text as={"p"} fontWeight={"bold"} variant={"bodyLg"}>
                                        Total
                                    </Text>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{xl: 9}}>
                                    <Text fontWeight={"bold"} alignment={"end"} as={"p"} variant={"bodyLg"}>
                                        {`${order?.currencyCode} ${order.totalPriceSet?.shopMoney?.amount}`}
                                    </Text>
                                </Grid.Cell>
                            </>}
                        </Grid>
                    </VerticalStack>
                </LegacyCard.Section>
            </LegacyCard>
        )
    }

    const Notes = () => {
        return (
            <LegacyCard title={"Notes"}>
                <LegacyCard.Section>
                    {order.note && order.note.length ?
                        <Text as={"p"} variant={"bodyMd"}>
                            {order.note}
                        </Text>
                        :
                        <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                            Empty
                        </Text>
                    }
                </LegacyCard.Section>
            </LegacyCard>
        )
    }

    const Customer = () => {
        return (
            <LegacyCard title={"Customer"}>
                {
                    order.customer ?
                        <>
                            <LegacyCard.Section>
                                <Text as={"p"} variant={"bodyLg"}>
                                    <Link
                                        url={`${DEFAULT_URL}/customers/${order.customer.id.split('/').at(-1)}`}
                                        target={"_blank"}>{order.customer.displayName}</Link>
                                </Text>
                            </LegacyCard.Section>
                            <LegacyCard.Section title={"CONTACT INFORMATION"}>
                                {order.customer.email ?
                                    <Text as={"p"} variant={"bodyLg"}>
                                        {order.customer.email}
                                    </Text>
                                    :
                                    <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                                        No email
                                    </Text>
                                }
                                <br/>
                                {order.customer.phone ?
                                    <Text as={"p"} variant={"bodyLg"}>
                                        {order.customer.phone}
                                    </Text>
                                    :
                                    <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                                        No phone number
                                    </Text>
                                }
                            </LegacyCard.Section>
                            <LegacyCard.Section title={"SHIPPING ADDRESS"}>
                                <VerticalStack gap={"1"}>
                                    {order.shippingAddress && order.shippingAddress.formatted.length ?
                                        order.shippingAddress.formatted.map((o: string) => (
                                            <Text as={"p"} variant={"bodyLg"}>
                                                {o}
                                            </Text>))
                                        :
                                        <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                                            Empty
                                        </Text>
                                    }
                                </VerticalStack>
                            </LegacyCard.Section>
                            <LegacyCard.Section title={"BILLING ADDRESS"}>
                                <VerticalStack gap={"1"}>
                                    {order.billingAddressMatchesShippingAddress ?
                                        <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                                            Same as shipping address
                                        </Text>
                                        :
                                        order.billingAddress && order.billingAddress.formatted.length ?
                                            order.billingAddress.formatted.map((o: string) => (
                                                <Text as={"p"} variant={"bodyLg"}>
                                                    {o}
                                                </Text>))
                                            :
                                            <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                                                Empty
                                            </Text>
                                    }
                                </VerticalStack>
                            </LegacyCard.Section>
                        </>
                        :
                        <LegacyCard.Section>
                            <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                                Empty
                            </Text>
                        </LegacyCard.Section>
                }
            </LegacyCard>
        )
    }

    const Tags = () => {
        return (
            <LegacyCard title={"Tags"}>
                <LegacyCard.Section>
                    {order.tags && order.tags.length ?
                        order.tags.map((o: string) => (
                            <Badge status={"enabled-experimental"}>
                                {o}
                            </Badge>))
                        :
                        <Text as={"p"} color={"subdued"} variant={"bodyMd"}>
                            Empty
                        </Text>
                    }
                </LegacyCard.Section>
            </LegacyCard>
        )
    }

    return (
        <VerticalStack gap={"4"} align={"center"}>
            <VerticalStack gap={"2"}>
                <HorizontalStack align={"space-between"} blockAlign={"center"}>
                    <HorizontalStack blockAlign={"center"} gap={"3"}>
                        <Text as={"h1"} variant={"heading4xl"}>Order {order.name}</Text>
                        <Badge status={getStatusBadge(order.displayFinancialStatus)}
                               progress={getProgressBadge(order.displayFinancialStatus)}>
                            {capitalize(order.displayFinancialStatus)}
                        </Badge>
                        <Badge status={getStatusBadge(order.displayFulfillmentStatus)}
                               progress={getProgressBadge(order.displayFulfillmentStatus)}>
                            {capitalize(order.displayFulfillmentStatus)}
                        </Badge>
                    </HorizontalStack>
                    <Button onClick={handleClick} size={"medium"} icon={ViewMinor}>View</Button>
                </HorizontalStack>
                <Text as={"h4"} color={"subdued"}>{moment(order.createdAt).format('MMM DD, YYYY hh:mm')}</Text>
            </VerticalStack>
            <Grid columns={{xl: 12}}>
                <Grid.Cell columnSpan={{xl: 9}}>
                    <VerticalStack gap={"3"} align={"center"}>
                        <OrderDetails/>
                        <PaymentDetails/>
                    </VerticalStack>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xl: 3}}>
                    <VerticalStack gap={"3"}>
                        <Notes/>
                        <Customer/>
                        <Tags/>
                    </VerticalStack>
                </Grid.Cell>
            </Grid>
        </VerticalStack>
    );
};
