import React, {useCallback, useEffect, useState} from 'react';
import {useAuthenticatedFetch} from "../../hooks";
import {useQuery} from "@tanstack/react-query";
import {E_SORT, I_OrdersGetDto} from "../../graphql/orders.interfaces";
import {I_Default} from "../../graphql/default.interface";
import {GET_ORDERS_QUERY, GET_ORDERS_TOP5} from "../../graphql/orders.graphql";
// @ts-ignore
import {LineChart, ColumnChart} from 'react-chartkick'
import 'chartkick/chart.js'
import {BarChartIcon, LineChartIcon} from "../../assets/svg-components";
import {Box, HorizontalStack, IndexTable, LegacyCard, Text, Tooltip, VerticalStack} from "@shopify/polaris";
import {Link} from 'react-router-dom';

import './style.module.css'
import {useToast} from "@shopify/app-bridge-react";

function useOrders() {
    const fetch = useAuthenticatedFetch();
    return useQuery(["orders"], async () => {
        const nowDate = new Date();
        const body = {
            query: GET_ORDERS_QUERY,
            params: {
                sort: E_SORT.createdAt,
                first: 50,
                query: `createdAt:=${nowDate.getFullYear()}-${nowDate.getMonth()}`
            }
        } as I_Default<I_OrdersGetDto>;

        const res = await fetch("/api/graphql", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        // @ts-ignore
        return (await res.json()).body?.data?.orders?.nodes ?? [];
    });
}

function useTopOrders() {
    const fetch = useAuthenticatedFetch();
    return useQuery(["top_orders"], async () => {
        const body = {
            query: GET_ORDERS_TOP5
        } as I_Default<I_OrdersGetDto>;

        const res = await fetch("/api/graphql", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        // @ts-ignore
        return (await res.json()).body?.data?.orders?.nodes ?? [];
    });
}

export const Home = () => {
    const {data: orders, isLoading: isLoadingOrders, isError: isErrorOrders,} = useOrders();
    const {data: ordersTop, isLoading: isLoadingTop, isError: isErrorTop} = useTopOrders();
    const [formatted, setFormatted] = useState([])
    const [chart, setChart] = useState<"line" | "bar">("line")
    const { show: showToast } = useToast();

    useEffect(() => {
        if (orders && !isErrorOrders) {
            const dateCounts: any = {};

            // @ts-ignore
            orders?.forEach((order) => {
                const createdAt = new Date(order.createdAt);
                const date = createdAt.toISOString().split('T')[0]; // Extract the date in YYYY-MM-DD format

                if (dateCounts[date]) {
                    dateCounts[date]++;
                } else {
                    dateCounts[date] = 1;
                }
            });

            setFormatted(dateCounts);
        }
    }, [orders, isErrorOrders]);

    useEffect(() => {
        if(isErrorOrders)
            showToast("Error fetch orders list", {isError: true})

        if(isErrorTop)
            showToast("Error fetch top orders", {isError: true})
    }, [isErrorOrders, isErrorTop]);

    const rowMarkup = useCallback(() => {
        return ordersTop ? ordersTop.map(
            (o: any, index: number) => (
                <IndexTable.Row id={o.id} key={o.id} position={index}>
                    <IndexTable.Cell>
                        <Text variant="bodyMd" fontWeight="bold" as="span">
                            <Link to={`/orders/${o.id.split('/').at(-1)}`}>{o.name}</Link>
                        </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell><Text as={"h3"} alignment={"center"}>$ {o.totalPrice}</Text></IndexTable.Cell>
                </IndexTable.Row>
            ),
        ) : <></>;
    }, [ordersTop]);

    const handleClickChart = () => {
        setChart('line')
    }

    const handleClickBar = () => {
        setChart('bar')
    }

    return (
        <VerticalStack gap={"10"}>
            <VerticalStack gap={"8"}>
                <Text variant={"heading4xl"} as={"h1"}>
                    Welcome back!
                </Text>
                <LegacyCard sectioned>
                    <HorizontalStack align={"space-between"} blockAlign={"center"}>
                        <Text as={"h2"} variant={"headingLg"}>Orders</Text>
                        <Box borderRadius={"500"} as={"div"} padding={"2"} paddingBlockStart={"1"} paddingBlockEnd={"1"}
                             borderColor={"border-input-active-experimental"} borderWidth={"1"}
                             aria-details={chart === 'line' ? 'first' : 'second'} position={"relative"}>
                            <HorizontalStack align={"center"} blockAlign={"center"} gap={"2"}>
                                <Box as={"span"} width={"28px"} minHeight={"28px"} borderRadius={"500"}
                                     aria-details={"selector"}/>
                                <Tooltip content={"Line chart"}>
                                <span aria-details={"span-ico"} onClick={handleClickChart}>
                                            <LineChartIcon/>
                                        </span>
                                </Tooltip>
                                <Tooltip content={"Bar chart"}>
                                <span aria-details={"span-ico"} onClick={handleClickBar}>
                                            <BarChartIcon/>
                                        </span>
                                </Tooltip>
                            </HorizontalStack>
                        </Box>
                        {chart === 'line' ? <LineChart empty={'No data'} label={"Orders"} data={formatted}/> :
                            <ColumnChart empty={isLoadingTop ? 'Loading data...' : 'No data'} label={"Orders"}
                                         data={formatted}/>}
                    </HorizontalStack>
                </LegacyCard>
            </VerticalStack>
            <VerticalStack gap={"4"}>
                <Text as={"h2"} variant={"headingXl"}>
                    Top 5 Orders
                </Text>
                <LegacyCard>
                    <IndexTable
                        selectable={false}
                        headings={[
                            {title: 'Order Name', alignment: "start"},
                            {title: 'Total Price', alignment: "center"},
                        ]}
                        resourceName={{singular: 'order', plural: 'orders'}}
                        emptyState={<Text as={"h1"}
                                          variant={"headingMd"}>{isLoadingOrders ? 'Loading data...' : 'No data found.'}</Text>}
                        itemCount={ordersTop?.length ?? 0}
                        lastColumnSticky={true}
                    >
                        {rowMarkup()}
                    </IndexTable>
                </LegacyCard>
            </VerticalStack>
        </VerticalStack>
    );
};
