import React, {useEffect, useState} from 'react';
import {useAuthenticatedFetch} from "../../hooks";
import {useQuery} from "@tanstack/react-query";
import {I_Default} from "../../graphql/default.interface";
import {useToast} from "@shopify/app-bridge-react";
import {Page, Text, VerticalStack} from "@shopify/polaris";
import ProductsTable from "./ProductsTable";
import {E_SORT_PRODUCTS, I_ProductsGetDto} from "../../graphql/products/products.interfaces";
import {GET_PRODUCT_APPS, GET_PRODUCT_MARKETS, GET_PRODUCTS} from "../../graphql/products/products.graphql";

function useGetProducts(data: I_ProductsGetDto) {
    const fetch = useAuthenticatedFetch();

    return useQuery([Object.entries(data)], async () => {
        const body = {
            query: GET_PRODUCTS,
            params: data,
        } as I_Default<I_ProductsGetDto>;

        const res = await fetch("/api/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        // @ts-ignore
        return (await res.json()).body;
    });
}

function useGetProductsApps(data: I_ProductsGetDto) {
    const fetch = useAuthenticatedFetch();

    return useQuery([Object.entries(data)], async () => {
        const body = {
            query: GET_PRODUCT_APPS,
            params: data,
        } as I_Default<I_ProductsGetDto>;

        const res = await fetch("/api/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        // @ts-ignore
        return (await res.json()).body;
    });
}

function useGetProductsMarkets(data: I_ProductsGetDto) {
    const fetch = useAuthenticatedFetch();

    return useQuery([Object.entries(data)], async () => {
        const body = {
            query: GET_PRODUCT_MARKETS,
            params: data,
        } as I_Default<I_ProductsGetDto>;

        const res = await fetch("/api/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        // @ts-ignore
        return (await res.json()).body;
    });
}

export const Products = () => {
    const [options, setOptions] = useState<I_ProductsGetDto>({
        sort: E_SORT_PRODUCTS.createdAt,
        first: 10,
        reverse: false,
    });
    const { data, isLoading, isError } = useGetProducts(options);
    const { data:dataApps, isLoading:isLoadingApps, isError:isErrorApps } = useGetProducts(options);
    const { data:dataMarkets, isLoading:isLoadingMarkets, isError:isErrorMarkets } = useGetProducts(options);

    const { show: showToast } = useToast();

    useEffect(() => {
        if (isError && !isLoading) showToast("Error fetch products list", { isError: true });
    }, [isError, isLoading]);

    const onChange = (options: I_ProductsGetDto) => {
        setOptions(options);
    };

    return (
        <Page fullWidth>
            <VerticalStack gap={"12"}>
                <VerticalStack gap={"2"}>
                    <Text fontWeight={"bold"} as={"h1"} variant={"heading4xl"}>
                        Products
                    </Text>
                    <Text fontWeight={"regular"} as={"p"} variant={"bodyLg"}>
                        Track your products
                    </Text>
                </VerticalStack>
                <ProductsTable data={{dataApps, dataMarkets, allData: data}} loadings={{allDataLoading: isLoading, dataMarketsLoading: isLoadingMarkets, dataAppsLoading: isLoadingApps}} onRequest={onChange} />
            </VerticalStack>
        </Page>
    );
};
