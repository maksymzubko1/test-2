import React, {useEffect, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {useToast} from "@shopify/app-bridge-react";
import {Button, HorizontalStack, Page, Text, VerticalStack} from "@shopify/polaris";
import ProductsTable from "./ProductsTable";
import {E_SORT_PRODUCTS, I_ProductsGetDto} from "../../graphql/products/products.interfaces";
import {useNavigate} from "react-router-dom";
import {E_Routes} from "../../Routes";
import {queryProductsAppsGet, queryProductsMarketsGet, queryProductsGet} from "./requests";
import {useAuthenticatedFetch} from "../../hooks";

function useGetProducts(data: I_ProductsGetDto) {
    const fetch = useAuthenticatedFetch();
    return useQuery(['products', Object.entries(data)], async () => {
        return await queryProductsGet(fetch, data);
    });
}

function useGetProductsApps(data: I_ProductsGetDto) {
    const fetch = useAuthenticatedFetch();
    return useQuery(['apps',Object.entries(data)], async () => {
        return await queryProductsAppsGet(fetch, data);
    });
}

function useGetProductsMarkets(data: I_ProductsGetDto) {
    const fetch = useAuthenticatedFetch();
    return useQuery(['markets',Object.entries(data)], async () => {
        return await queryProductsMarketsGet(fetch, data);
    });
}

export const Products = () => {
    const [options, setOptions] = useState<I_ProductsGetDto>({
        sort: E_SORT_PRODUCTS.createdAt,
        first: 10,
        reverse: false,
    });
    const navigate = useNavigate();
    const { data, isLoading, isError, isRefetching } = useGetProducts(options);
    const { data:dataApps, isLoading:isLoadingApps, isError:isErrorApps } = useGetProductsApps(options);
    const { data:dataMarkets, isLoading:isLoadingMarkets, isError:isErrorMarkets } = useGetProductsMarkets(options);

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
                <HorizontalStack align={"space-between"} blockAlign={"center"}>
                <VerticalStack gap={"2"}>
                    <Text fontWeight={"bold"} as={"h1"} variant={"heading4xl"}>
                        Products
                    </Text>
                    <Text fontWeight={"regular"} as={"p"} variant={"bodyLg"}>
                        Track your products
                    </Text>
                </VerticalStack>
                    <Button primary onClick={()=>navigate(`${E_Routes.products}/new`)}>Add product</Button>
                </HorizontalStack>
                <ProductsTable data={{dataApps, dataMarkets, allData: data}} loadings={{allDataLoading: isLoading, dataMarketsLoading: isLoadingMarkets, dataAppsLoading: isLoadingApps}} isRefetching={isRefetching} onRequest={onChange} />
            </VerticalStack>
        </Page>
    );
};
