import React, {useCallback, useState} from 'react';
import {CustomModal} from "../../../../components/Modal/Modal";
import {Box, Frame, Modal, Text, Toast} from '@shopify/polaris';
import {ARCHIVE_PRODUCT} from "../../../../graphql/products/products.graphql";
import {I_Default} from "../../../../graphql/default.interface";
import {E_STATUS_PRODUCTS, I_MutationProductArchive} from "../../../../graphql/products/products.interfaces";
import {useAuthenticatedFetch} from "../../../../hooks";

interface I_Props {
    id: number;
    opened: boolean;
    onClose: () => void;
    refetch: () => Promise<any>;
    status: E_STATUS_PRODUCTS;
}

export const ArchiveModal = ({opened, id, onClose, refetch, status}: I_Props) => {
    const fetch = useAuthenticatedFetch();

    const emptyToastProps: any = {content: null};
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const [isLoading, setIsLoading] = useState(false);

    const toastMarkup = toastProps.content && (
        <Toast {...toastProps} error duration={1000} onDismiss={() => setToastProps(emptyToastProps)}/>
    );

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);

        let isError = false;

        const body = {
            query: ARCHIVE_PRODUCT,
            params: {
                product: {
                    id: `gid://shopify/Product/${id}`,
                    status
                }
            },
        } as I_Default<I_MutationProductArchive>;

        const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });

        if (response.ok) {
            // @ts-ignore
            const body = (await response.json())?.body;
            if (!body?.data?.productDuplicate?.userErrors?.length) {
                await refetch();
                onClose();
            } else {
                isError = true;
            }
        } else {
            isError = true;
        }

        if (isError) {
            // TODO: fix hardcode exception
            setToastProps({
                content: "Error during change product status",
            })
        }

        setIsLoading(false);
    }, [id]);

    return (
        <>
            <CustomModal
                title={status === 'ARCHIVED' ? "Archive product?" : "Unarchive product?"}
                opened={opened}
                onClose={onClose}
                primaryAction={{
                    loading: isLoading,
                    content: status === 'ARCHIVED' ? 'Archive product' : 'Unarchive product',
                    onAction: handleSubmit
                }}
                secondaryActions={[{disabled: isLoading, content: 'Cancel', onAction: onClose}]}
            >
                <Modal.Section>
                    <Text as={"p"}>
                        {status === 'ARCHIVED' ?
                            `Archiving this product will hide it from your sales channels and Shopify admin. You’ll find it
                        using the status filter in your product list.`
                            : `Unarchiving this product will change its status to draft so you can work on it again.`
                        }
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
