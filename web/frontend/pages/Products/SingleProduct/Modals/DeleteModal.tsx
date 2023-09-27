import React, {useCallback, useEffect, useState} from 'react';
import {Box, ChoiceList, Divider, Frame, Modal, Text, TextField, Toast, VerticalStack} from "@shopify/polaris";
import {parseValidationResult, validateStatus, validateTitle} from "../../validators";
import {
    E_STATUS_PRODUCTS,
    I_MutationProductDelete,
    I_MutationProductDuplicate
} from "../../../../graphql/products/products.interfaces";
import {useNavigate} from "react-router-dom";
import {DELETE_PRODUCT, DUPLICATE_PRODUCT, GET_PRODUCT} from "../../../../graphql/products/products.graphql";
import {I_Default} from "../../../../graphql/default.interface";
import {useAuthenticatedFetch} from "../../../../hooks";
import {CustomModal} from "../../../../components/Modal/Modal";
import {E_Routes} from "../../../../Routes";

interface I_Props {
    id: number;
    opened: boolean;
    onClose: () => void;
    title: string;
}

export const DeleteModal = ({title, opened, id, onClose}: I_Props) => {
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();

    const emptyToastProps: any = {content: null};
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);

        let isError = false;

        const body = {
            query: DELETE_PRODUCT,
            params: {
                product: {
                    id: String(id)
                }
            },
        } as I_Default<I_MutationProductDelete>;

        const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });

        if (response.ok) {
            // @ts-ignore
            const body = (await response.json())?.body;
            if (!body?.data?.productDuplicate?.userErrors?.length) {
                onClose();
                navigate(E_Routes.products)
            } else {
                isError = true;
            }
        } else {
            isError = true;
        }

        if (isError) {
            // TODO: fix hardcode exception
            setToastProps({
                content: "Error during product delete",
            })
        }

        setIsLoading(false);
    }, []);

    const toastMarkup = toastProps.content && (
        <Toast {...toastProps} error duration={1000} onDismiss={() => setToastProps(emptyToastProps)}/>
    );

    return (
        <>
            <CustomModal
                title={`Delete product ${title}?`}
                opened={opened}
                onClose={onClose}
                primaryAction={{
                    loading: isLoading,
                    content: 'Delete product',
                    onAction: handleSubmit,
                    destructive: true
                }}
                secondaryActions={[{disabled: isLoading, content: 'Cancel', onAction: onClose}]}
            >
                <Modal.Section>
                    <Text as={"p"}>
                        {`Are you sure you want to delete the product ${title}? This can’t be
                        undone.`}
                    </Text>
                </Modal.Section>
            </CustomModal>
            <Box position={"absolute"}>
                <Frame>
                    {toastMarkup}
                </Frame>
            </Box>
        </>
    );
};
