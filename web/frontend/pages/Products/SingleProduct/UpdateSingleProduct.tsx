import React, {useCallback, useEffect, useState} from 'react';
import {E_Routes} from "../../../Routes";
import {Badge, Button, ButtonGroup, HorizontalStack, Page, Spinner, Text,} from '@shopify/polaris';
import {useLocation, useNavigate} from "react-router-dom";
import {useAuthenticatedFetch} from "../../../hooks";
import {useQuery} from "@tanstack/react-query";
import {useToast} from "@shopify/app-bridge-react";
import {ProductContent} from "./ProductContent";
import {capitalize} from "../../../utils/capitalize";
import {openNewTab} from "../../../utils/openNewTab";
import {Status} from "@shopify/polaris/build/ts/src/components/Badge/types";
import {E_STATUS_PRODUCTS} from "../../../graphql/products/products.interfaces";
import {DuplicateModal} from "./Modals/DuplicateModal";
import {queryProductGet} from "../requests";

function useGetProduct(id: number) {
    const fetch = useAuthenticatedFetch();

    return useQuery([id], async () => {
        return await queryProductGet(fetch,id);
    });
}

export function getBadgeStatus(status: string): Status {
    switch (status) {
        case E_STATUS_PRODUCTS.draft:
            return "info";
        case E_STATUS_PRODUCTS.active:
            return "success";
        default:
            return "enabled-experimental";
    }
}

export const UpdateSingleProduct = () => {
    const location = useLocation();
    const id = parseInt(location.pathname.split("/").at(-1));
    const navigate = useNavigate();

    const [duplicateModalOpened, setDuplicateModalOpened] = useState(false)

    if (isNaN(id))
        return (
            <Page
                fullWidth
                backAction={{
                    onAction() {
                        navigate(E_Routes.orders);
                    },
                }}
            >
                <Text fontWeight={"bold"} variant={"heading4xl"} as={"h1"}>
                    Invalid id
                </Text>
            </Page>
        );

    const {data, isLoading, isError, refetch} = useGetProduct(id);
    const {show: showToast} = useToast();

    useEffect(() => {
        if (isError || (!isLoading && !data?.data?.product))
            showToast("Error fetch this order", {isError: true});
    }, [isError, isLoading]);


    const {product} = data?.data ?? {};

    const handlePreview = useCallback(() => {
        openNewTab(product?.onlineStorePreviewUrl)
    }, [product?.onlineStorePreviewUrl]);

    const handleCloseDuplicateModal = useCallback(() => {
        setDuplicateModalOpened(false);
    }, []);

    const handleOpenDuplicateModal = useCallback(() => {
        setDuplicateModalOpened(true);
    }, []);

    return (
        <Page
            fullWidth
            titleMetadata={
                <HorizontalStack gap={"2"}>
                        <Text as={"h2"} variant={"headingLg"} alignment={"center"}>
                            {product?.title}
                        </Text>
                        <Text as={"h2"} variant={"headingMd"} alignment={"center"}>
                            {product?.status && <Badge
                                status={getBadgeStatus(product.status)}>{capitalize(product.status)}</Badge>}
                        </Text>
                    </HorizontalStack>
            }
            secondaryActions={data?.data?.product ?
                <ButtonGroup>
                    <Button onClick={handleOpenDuplicateModal}>Duplicate</Button>
                    <Button onClick={handlePreview}>Preview</Button>
                </ButtonGroup>
                : <></>}
            backAction={{
                onAction() {
                    navigate(E_Routes.products);
                },
            }}
        >
            {isLoading && <Spinner/>}
            {!isLoading && (isError || !data?.data?.product) && (
                <Text fontWeight={"bold"} variant={"heading4xl"} as={"h1"}>
                    Cannot fetch this order
                </Text>
            )}
            {(!isLoading && !(isError || !data?.data?.product)) && (
                <ProductContent product={product} refetch={refetch}/>
            )}
            {product?.title && <DuplicateModal
                status={product?.status}
                title={product?.title}
                id={id}
                onClose={handleCloseDuplicateModal}
                opened={duplicateModalOpened}
            />}
        </Page>
    );
};