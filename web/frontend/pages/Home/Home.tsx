import React, {useCallback, useEffect, useState} from 'react';
import {useAuthenticatedFetch} from "../../hooks";
import {useQuery} from "@tanstack/react-query";
import {E_SORT, I_OrdersGetDto} from "../../graphql/orders.interfaces";
import {I_Default} from "../../graphql/default.interface";
import {GET_ORDERS_QUERY, GET_ORDERS_TOP5} from "../../graphql/orders.graphql";
// @ts-ignore
import {LineChart, PieChart, ColumnChart} from 'react-chartkick'
import 'chartkick/chart.js'
import cl from './style.module.css'
import {BarChartIcon, LineChartIcon} from "../../assets/svg-components";
import {DataTable, Grid, IndexTable, Layout, LegacyCard, Text} from "@shopify/polaris";
import { Link } from 'react-router-dom';

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
    const {data:orders, isLoading:isLoadingOrders, isError:isErrorOrders,} = useOrders();
    const {data:ordersTop, isLoading:isLoadingTop, isError:isErrorTop} = useTopOrders();
    const [formatted, setFormatted] = useState([])
    const [chart, setChart] = useState<"line" | "bar">("line")

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

    const rowMarkup = useCallback(() => {
        return ordersTop ? ordersTop.map(
            (o:any, index:number) => (
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
        <Grid columns={{xl: 1}}>
            <Grid columns={{xl: 1}}>
                <Text variant={"heading2xl"} as={"h1"}>
                    Welcome back!
                </Text>
                <LegacyCard sectioned>
                    <div className={cl.chart_container}>
                        <div className={`${cl.chart_buttons} ${chart === 'line' ? cl.first : cl.second}`}>
                            <span className={`${cl.selector}`}></span>
                            <span onClick={handleClickChart}>
                                    <BarChartIcon/>
                                </span>
                            <span onClick={handleClickBar}>
                                    <LineChartIcon/>
                                </span>
                        </div>
                        {chart === 'line' ? <LineChart empty={'No data'} label={"Orders"} data={formatted}/> :
                            <ColumnChart empty={isLoadingTop ? 'Loading data...' : 'No data'} label={"Orders"} data={formatted}/>}
                    </div>
                </LegacyCard>
            </Grid>
            <Grid columns={{xl: 1}}>
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
                        emptyState={<Text as={"h1"} variant={"headingMd"}>{isLoadingOrders ? 'Loading data...' : 'No data found.'}</Text>}
                        /*@ts-ignore*/
                        itemCount={ordersTop?.length ?? 0}
                        lastColumnSticky={true}
                    >
                        {rowMarkup()}
                    </IndexTable>
                </LegacyCard>
            </Grid>
        </Grid>
    );
};
