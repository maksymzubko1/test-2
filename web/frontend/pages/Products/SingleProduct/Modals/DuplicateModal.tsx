import React, {useCallback, useEffect, useState} from 'react';
import {Box, ChoiceList, Divider, Frame, Modal, TextField, Toast, VerticalStack} from "@shopify/polaris";
import {parseValidationResult, validateStatus, validateTitle} from "../../validators";
import {E_STATUS_PRODUCTS, I_MutationProductDuplicate} from "../../../../graphql/products/products.interfaces";
import {useNavigate} from "react-router-dom";
import {DUPLICATE_PRODUCT, GET_PRODUCT} from "../../../../graphql/products/products.graphql";
import {I_Default} from "../../../../graphql/default.interface";
import {useAuthenticatedFetch} from "../../../../hooks";
import {CustomModal} from "../../../../components/Modal/Modal";

interface I_Props {
    title: string;
    status: string;
    id: number;
    opened: boolean;
    onClose: () => void;
}

export const DuplicateModal = ({title, status, id, onClose, opened}: I_Props) => {
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();

    const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
    const [newTitle, setNewTitle] = useState<string>(`Copy of ${title}`);
    const [errors, setErrors] = useState(null)
    const [newStatus, setNewStatus] = useState<string[]>([status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT']);
    const emptyToastProps: any = {content: null};
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const [isLoading, setIsLoading] = useState(false);

    const handleStatus = useCallback(
        (value: string[]) => setNewStatus(value),
        [],
    );

    const handleSelectedDetails = useCallback(
        (value: string[]) => setSelectedDetails(value),
        [],
    );

    const handleNewTitle = useCallback(
        (value: string) => setNewTitle(value),
        [],
    );

    const handleClose = () => {
        onClose();
        handleSelectedDetails([]);
        handleNewTitle(`Copy of ${title}`);
        handleStatus([status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT']);
    };

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);

        const errors = [
            validateTitle(newTitle),
            validateStatus(newStatus[0])
        ]

        const getParsedErrors = parseValidationResult(errors);

        if (Object.keys(getParsedErrors).length) {
            setErrors(getParsedErrors);
            setIsLoading(false);
            return;
        }

        let isError = false;

        const body = {
            query: DUPLICATE_PRODUCT,
            params: {
                productId: `gid://shopify/Product/${id}`,
                newStatus: newStatus[0],
                newTitle,
                copyImages: selectedDetails.includes('images')
            },
        } as I_Default<I_MutationProductDuplicate>;

        const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });

        if (response.ok) {
            // @ts-ignore
            const body = (await response.json())?.body;
            if (!body?.data?.productDuplicate?.userErrors?.length) {
                const id = body.data.productDuplicate.newProduct.id;
                onClose();
                navigate(`/products/${id.split("/").at(-1)}`)
            } else {
                isError = true;
            }
        } else {
            isError = true;
        }

        if (isError) {
            // TODO: fix hardcode exception
            setToastProps({
                content: "Error during product duplicate",
            })
        }

        setIsLoading(false);
    }, [newTitle, newStatus]);

    useEffect(() => {
        if (errors) {
            setErrors(null);
        }
    }, [newTitle, newStatus, selectedDetails]);

    const toastMarkup = toastProps.content && (
        <Toast {...toastProps} error duration={1000} onDismiss={() => setToastProps(emptyToastProps)}/>
    );

    return (
        <>
            <CustomModal
                title={"Duplicate product"}
                primaryAction={{loading: isLoading, content: 'Duplicate product', onAction: handleSubmit}}
                secondaryActions={[{disabled: isLoading, content: 'Cancel', onAction: handleClose}]}
                opened={opened}
                onClose={onClose}
            >
                <Modal.Section>
                    <VerticalStack gap={"3"}>
                        <TextField
                            requiredIndicator
                            label={"Title"}
                            autoComplete={"off"}
                            value={newTitle}
                            onChange={handleNewTitle}
                            error={errors?.title?.message}
                        />
                        <Divider/>
                        <ChoiceList
                            title="Select details to copy. All other details except 3D models and videos will be copied from the original product and any variants."
                            choices={[
                                {label: 'Images', value: 'images'}
                            ]}
                            allowMultiple
                            selected={selectedDetails}
                            onChange={handleSelectedDetails}
                        />
                        <Divider/>
                        <ChoiceList
                            title="Product status"
                            choices={[
                                {
                                    label: `Set as ${E_STATUS_PRODUCTS.draft.toLowerCase()}`,
                                    value: E_STATUS_PRODUCTS.draft
                                },
                                {
                                    label: `Set as ${E_STATUS_PRODUCTS.active.toLowerCase()}`,
                                    value: E_STATUS_PRODUCTS.active
                                },
                            ]}
                            error={errors?.status?.message}
                            selected={newStatus}
                            onChange={handleStatus}
                        />
                    </VerticalStack>
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
