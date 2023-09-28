import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Box, Button, ButtonGroup,
    HorizontalStack, Icon,
    Label,
    Layout,
    LegacyCard, LegacyStack, PageActions,
    Select,
    Text,
    TextField,
    VerticalStack
} from "@shopify/polaris";
import JoditEditor from "jodit-react";
import {capitalize} from "../../../utils/capitalize";
import {
    E_STATUS_PRODUCTS,
} from "../../../graphql/products/products.interfaces";
import {ArchiveModal} from "./Modals/ArchiveModal";
import {ArchiveMinor} from "@shopify/polaris-icons";
import {DeleteModal} from "./Modals/DeleteModal";
import {parseValidationResult, validateStatus, validateTitle} from "../validators";
import {useAuthenticatedFetch} from "../../../hooks";
import {useToast} from "@shopify/app-bridge-react";
import {useNavigate} from "react-router-dom";
import {E_Routes} from "../../../Routes";
import {shopifyIdToNumber} from "../../../utils/shopifyIdToNumber";
import {mutationProductCreate, mutationProductUpdate} from "../requests";

interface I_Props {
    product: any;
    refetch?: () => Promise<any>;
    isCreate?: boolean;
}

export const ProductContent = ({product, refetch, isCreate}: I_Props) => {
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")
    const editor = useRef(null);
    const [status, setStatus] = useState("DRAFT");
    const [initialValues, setInitialValues] = useState({status: "DRAFT", title: "", descriptionHtml: ""})
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState(null)
    const {show: showToast} = useToast();
    const [unArchiveModalOpened, setUnArchiveModalOpened] = useState(false)
    const [archiveModalOpened, setArchiveModalOpened] = useState(false)
    const [deleteModalOpened, setDeleteModalOpened] = useState(false)

    useEffect(() => {
        if (product) {
            setStatus(product?.status);
            setTitle(product?.title);
            setDescription(product?.descriptionHtml);

            setInitialValues({
                status: product?.status,
                title: product?.title,
                descriptionHtml: product?.descriptionHtml
            })
        }
    }, [product]);

    const handleStatusChange = useCallback(
        (value: string) => setStatus(value),
        [],
    );

    const getStatusList = useCallback(() => {
        return [
            {label: capitalize(E_STATUS_PRODUCTS.draft), value: E_STATUS_PRODUCTS.draft},
            {label: capitalize(E_STATUS_PRODUCTS.active), value: E_STATUS_PRODUCTS.active}
        ]
    }, [product?.status]);

    const handleChangeTitle = useCallback(
        (newValue: string) => setTitle(newValue),
        [],
    );
    const handleClearButtonClick = useCallback(() => setTitle(''), []);

    const handleChangeDescription = useCallback(
        (newValue: string) => setDescription(newValue),
        [],
    );

    const handleCloseUnArchiveModal = useCallback(() => {
        setUnArchiveModalOpened(false);
    }, []);

    const handleOpenUnArchiveModal = useCallback(() => {
        setUnArchiveModalOpened(true);
    }, []);

    const handleCloseArchiveModal = useCallback(() => {
        setArchiveModalOpened(false);
    }, []);

    const handleOpenArchiveModal = useCallback(() => {
        setArchiveModalOpened(true);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setDeleteModalOpened(false);
    }, []);

    const handleOpenDeleteModal = useCallback(() => {
        setDeleteModalOpened(true);
    }, []);

    const shouldDisable = useCallback(() => {
        return !(initialValues?.title !== title || initialValues?.descriptionHtml !== description || initialValues?.status !== status);
    }, [status, title, description, initialValues]);

    const handleSave = useCallback(async () => {
        setIsLoading(true);

        const errors = [
            validateTitle(title),
            validateStatus(status)
        ]

        const getParsedErrors = parseValidationResult(errors);

        if (Object.keys(getParsedErrors).length) {
            setErrors(getParsedErrors);
            setIsLoading(false);
            return;
        }

        try{
            const body = {
                product: {
                    id: isCreate ? undefined : product.id,
                    title,
                    descriptionHtml: description,
                    status: status as E_STATUS_PRODUCTS
                }
            };

            const response = isCreate ?
                await mutationProductCreate(fetch, body)
                : await mutationProductUpdate(fetch, body);

            if (!isCreate) {
                await refetch();
            } else {
                const id = shopifyIdToNumber(response?.data?.productCreate?.product?.id);
                navigate(`${E_Routes.products}/${id}`)
            }
        }catch (error){
            // TODO: fix hardcode exception
            showToast(`Error during product ${isCreate ? 'create' : 'update'}`, {isError: true})
        }finally {
            setIsLoading(false)
        }
    }, [title, status, description]);

    return (
        <>
            <Layout>
                <Layout.Section>
                    <LegacyCard>
                        <LegacyCard.Section>
                            <VerticalStack gap={"3"}>
                                <TextField
                                    placeholder={"Example: Item #1"}
                                    label={"Title"}
                                    value={title}
                                    requiredIndicator
                                    onChange={handleChangeTitle}
                                    clearButton
                                    error={errors?.title?.message}
                                    onClearButtonClick={handleClearButtonClick}
                                    autoComplete={"off"}
                                />
                                <Box>
                                    <Label id={'label-for-editor'}>Description</Label>
                                    <Box paddingBlockStart={"1"}>
                                        <JoditEditor
                                            ref={editor}
                                            value={description}
                                            onChange={handleChangeDescription}
                                        />
                                    </Box>
                                </Box>
                            </VerticalStack>
                        </LegacyCard.Section>
                    </LegacyCard>
                </Layout.Section>
                <Layout.Section secondary>
                    <LegacyCard>
                        {status === E_STATUS_PRODUCTS.archived ?
                            <LegacyCard.Section title={
                                <HorizontalStack gap={"2"}>
                                    <LegacyStack>
                                        <Icon source={ArchiveMinor}/>
                                    </LegacyStack>
                                    <Text as={"p"} variant={"bodyMd"} fontWeight={"bold"}>
                                        Archived
                                    </Text>
                                </HorizontalStack>
                            }>
                                <VerticalStack gap={"3"}>
                                    <Text as={"p"} variant={"bodyMd"}>
                                        Hidden from your Shopify admin, except your product list.
                                    </Text>
                                    <Box>
                                        <Button size={"medium"} onClick={handleOpenUnArchiveModal}>Unarchive
                                            product</Button>
                                    </Box>
                                </VerticalStack>
                            </LegacyCard.Section>
                            : <LegacyCard.Section>
                                <Select
                                    label="Status"
                                    options={getStatusList()}
                                    onChange={handleStatusChange}
                                    value={status}
                                />
                            </LegacyCard.Section>
                        }
                    </LegacyCard>
                </Layout.Section>
            </Layout>
            <PageActions
                primaryAction={<Button loading={isLoading} disabled={shouldDisable()} onClick={handleSave}
                                       primary>Save</Button>}
                secondaryActions={!isCreate ?
                    <ButtonGroup>
                        {status !== E_STATUS_PRODUCTS.archived && <Button disabled={isLoading} onClick={handleOpenArchiveModal}>Archive product</Button>}
                        <Button disabled={isLoading} onClick={handleOpenDeleteModal} destructive>Delete product</Button>
                    </ButtonGroup>
                    : <></>
                }/>
            {!isCreate &&
                <>
                    <ArchiveModal
                        opened={archiveModalOpened}
                        onClose={handleCloseArchiveModal}
                        id={shopifyIdToNumber(product.id)}
                        refetch={refetch}
                        status={E_STATUS_PRODUCTS.archived}
                    />
                    <ArchiveModal
                        opened={unArchiveModalOpened}
                        onClose={handleCloseUnArchiveModal}
                        id={shopifyIdToNumber(product.id)}
                        refetch={refetch}
                        status={E_STATUS_PRODUCTS.draft}
                    />
                    <DeleteModal
                        opened={deleteModalOpened}
                        onClose={handleCloseDeleteModal}
                        id={product.id}
                        title={product.title}
                    />
                </>}
        </>
    );
};
