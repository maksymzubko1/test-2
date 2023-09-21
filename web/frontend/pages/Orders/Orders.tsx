import React, {useEffect, useState} from 'react';
import {Grid, Text, VerticalStack} from "@shopify/polaris";
import {useAuthenticatedFetch} from "../../hooks";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {GET_ORDERS_QUERY} from "../../graphql/orders.graphql";
import {I_Default} from "../../graphql/default.interface";
import {E_SORT, I_OrdersGetDto} from "../../graphql/orders.interfaces";
import OrdersTable from "./OrdersTable";
import {useToast} from "@shopify/app-bridge-react";

function useGetOrders(data: I_OrdersGetDto) {
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
    const { show: showToast } = useToast();

    useEffect(() => {
        if(isError)
            showToast("Error fetch orders list", {isError: true})
    }, [isError]);

    const onChange = (options: I_OrdersGetDto) => {
        setOptions(options)
    }

    return (
        <VerticalStack gap={"12"}>
            <VerticalStack gap={"2"}>
                <Text fontWeight={"bold"} as={"h1"} variant={"heading4xl"}>
                    Orders
                </Text>
                <Text fontWeight={"regular"} as={"p"} variant={"bodyLg"}>
                    Track your orders
                </Text>
            </VerticalStack>
            <OrdersTable data={data} isLoading={isLoading} onRequest={onChange}/>
        </VerticalStack>
    );
};
