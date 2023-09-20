import React, {useState} from 'react';
import {Grid, Text} from "@shopify/polaris";
import {useAuthenticatedFetch} from "../../hooks";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {GET_ORDERS_QUERY} from "../../graphql/orders.graphql";
import {I_Default} from "../../graphql/default.interface";
import {E_SORT, I_OrdersGetDto} from "../../graphql/orders.interfaces";
import OrdersTable from "./OrdersTable";

function useGetOrders(data: I_OrdersGetDto) {
    console.log('request')
    const fetch = useAuthenticatedFetch();

    return useQuery([Object.entries(data)], async () => {
        const body = {
            query: GET_ORDERS_QUERY,
            params: data
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
        return (await res.json()).body;
    });
}

export const Orders = () => {
    const [options, setOptions] = useState<I_OrdersGetDto>({sort: E_SORT.createdAt, first: 10, reverse: false})
    const {data, isLoading, isError} = useGetOrders(options)

    const onChange = (options: I_OrdersGetDto) => {
        console.log(options)
        setOptions(options)
    }

    return (
        <Grid columns={{xl: 1}}>
            <Grid.Cell>
                <Text fontWeight={"bold"} as={"h1"} variant={"heading3xl"}>
                    Orders
                </Text>
                <Text fontWeight={"regular"} as={"p"} variant={"bodyMd"}>
                    Track your orders
                </Text>
            </Grid.Cell>
            <OrdersTable data={data} isLoading={isLoading} onRequest={onChange}/>
        </Grid>
    );
};
