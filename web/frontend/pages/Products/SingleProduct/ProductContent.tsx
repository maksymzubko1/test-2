import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    Avatar,
    Box,
    Button,
    ButtonGroup, EmptyState,
    HorizontalStack,
    Icon,
    Label,
    Layout,
    LegacyCard,
    LegacyStack,
    PageActions, ResourceItem, ResourceList,
    Select,
    Text,
    TextField,
    VerticalStack,
} from "@shopify/polaris";
import JoditEditor from "jodit-react";
import {capitalize} from "../../../utils/capitalize";
import {E_STATUS_PRODUCTS} from "../../../graphql/products/products.interfaces";
import {ArchiveModal} from "./Modals/ArchiveModal";
import {ArchiveMinor} from "@shopify/polaris-icons";
import {DeleteModal} from "./Modals/DeleteModal";
import {
    parseValidationResult,
    validateStatus,
    validateTitle,
} from "../validators";
import {useAuthenticatedFetch} from "../../../hooks";
import {ResourcePicker, useToast} from "@shopify/app-bridge-react";
import {useNavigate} from "react-router-dom";
import {E_Routes} from "../../../Routes";
import {shopifyIdToNumber} from "../../../utils/shopifyIdToNumber";
import {mutationProductCreate, mutationProductUpdate} from "../requests";
// @ts-ignore
import {ColumnChart} from "react-chartkick";
import "chartkick/chart.js";
import {BaseResource, SelectPayload} from "@shopify/app-bridge-core/actions/ResourcePicker";
import {DEFAULT_IMAGE} from "../../../constants/constants";
import {openNewTab} from "../../../utils/openNewTab";

interface I_Props {
    product: any;
    refetch?: () => Promise<any>;
    isCreate?: boolean;
    analyze?: any;
}

export const ProductContent = ({product, refetch, isCreate, analyze}: I_Props) => {
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();

    const [formatted, setFormatted] = useState([])
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const editor = useRef(null);
    const [status, setStatus] = useState("DRAFT");
    const [initialValues, setInitialValues] = useState({
        status: "DRAFT",
        title: "",
        descriptionHtml: "",
        selectedIds: []
    });
    const [resourceOpened, setResourceOpened] = useState(false)
    const [selectedIdsResource, setSelectedIdsResource] = useState<BaseResource[]>([])
    const [selectedResource, setSelectedResource] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [p: string]: { message: string } }>(
        null
    );
    const {show: showToast} = useToast();
    const [unArchiveModalOpened, setUnArchiveModalOpened] = useState(false);
    const [archiveModalOpened, setArchiveModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);

    useEffect(() => {
        if (analyze) {
            setFormatted(analyze.map((a: any) => [a.event, a.actionCount]));
        }
    }, [analyze]);

    useEffect(() => {
        if (product) {
            setStatus(product?.status);
            setTitle(product?.title);
            setDescription(product?.descriptionHtml);

            let metaValue: any;
            let metaFullValue: any;
            try {
                const _metaTemp = JSON.parse(product?.metafields?.nodes?.at(0)?.value) as string[];
                metaFullValue = JSON.parse(product?.metafields?.nodes?.at(1)?.value);
                metaValue = _metaTemp.map(m => ({id: m}))
            } catch (e) {
                metaValue = [];
                metaFullValue = [];
            }

            setInitialValues({
                status: product?.status,
                title: product?.title,
                descriptionHtml: product?.descriptionHtml,
                selectedIds: metaValue
            });

            setSelectedResource(metaFullValue);
            setSelectedIdsResource(metaValue);
        }
    }, [product]);

    const handleStatusChange = useCallback(
        (value: string) => setStatus(value),
        []
    );

    const getStatusList = useCallback(() => {
        return [
            {
                label: capitalize(E_STATUS_PRODUCTS.draft),
                value: E_STATUS_PRODUCTS.draft,
            },
            {
                label: capitalize(E_STATUS_PRODUCTS.active),
                value: E_STATUS_PRODUCTS.active,
            },
        ];
    }, [product?.status]);

    const handleChangeTitle = useCallback(
        (newValue: string) => setTitle(newValue),
        []
    );
    const handleClearButtonClick = useCallback(() => setTitle(""), []);

    const handleChangeDescription = useCallback(
        (newValue: string) => setDescription(newValue),
        []
    );

    const handleToggleResource = useCallback(() => {
        setResourceOpened(prev => !prev);
    }, []);

    const handleSelectResource = useCallback((selectPayload: SelectPayload) => {
        const ids = selectPayload.selection.slice(0, 4).map(p => ({id: p.id}));
        setSelectedResource(selectPayload.selection.slice(0, 4));
        setSelectedIdsResource(ids);
    }, []);

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
        return !(
            initialValues?.title !== title ||
            initialValues?.descriptionHtml !== description ||
            initialValues?.status !== status ||
            JSON.stringify(initialValues.selectedIds) !== JSON.stringify(selectedIdsResource)
        );
    }, [status, title, description, initialValues, selectedIdsResource]);

    useEffect(() => {
        if (errors && errors?.title) {
            setErrors((prev) => {
                const {title, ...rest} = prev;
                return rest;
            });
        }
    }, [title]);

    useEffect(() => {
        if (errors && errors?.status) {
            setErrors((prev) => {
                const {status, ...rest} = prev;
                return rest;
            });
        }
    }, [status]);

    const handleSave = useCallback(async () => {
        setIsLoading(true);

        const errors = [validateTitle(title), validateStatus(status)];

        const getParsedErrors = parseValidationResult(errors);

        if (Object.keys(getParsedErrors).length) {
            setErrors(getParsedErrors);
            setIsLoading(false);
            return;
        }

        try {
            const metafieldIds = product?.metafields?.nodes?.map((m: any) => m.id);
            const body = {
                product: {
                    id: isCreate ? undefined : product.id,
                    title,
                    descriptionHtml: description,
                    status: status as E_STATUS_PRODUCTS,
                    metafields: isCreate ? undefined : [
                        {
                            id: metafieldIds?.at(0) ?? undefined,
                            namespace: 'custom',
                            value: JSON.stringify(selectedIdsResource.map(p => p.id)),
                            key: 'sub_items',
                            type: 'list.product_reference',
                        },
                        {
                            id: metafieldIds?.at(1) ?? undefined,
                            namespace: 'custom',
                            value: JSON.stringify(selectedResource),
                            key: 'sub_items_full',
                            type: 'json',
                        }
                    ]
                },
            };

            const response = isCreate
                ? await mutationProductCreate(fetch, body)
                : await mutationProductUpdate(fetch, body);

            if (!isCreate) {
                showToast(`Succesfully updated`);
                await refetch();
            } else {
                const id = shopifyIdToNumber(
                    response?.data?.productCreate?.product?.id
                );
                navigate(`${E_Routes.products}/${id}`);
            }
        } catch (error) {
            console.log(error)
            // TODO: fix hardcode exception
            showToast(`Error during product ${isCreate ? "create" : "update"}`, {
                isError: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [title, status, description, selectedIdsResource]);

    const emptyStateMarkup =
        !selectedResource.length ? (
            <EmptyState
                heading="Add related products to get started"
                action={{content: 'Add related products', onAction: handleToggleResource}}
                image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
            >
                <p>
                    You can use the Add related products button to add
                </p>
            </EmptyState>
        ) : undefined;

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
                                    <Label id={"label-for-editor"}>Description</Label>
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
                    {!isCreate && <LegacyCard title={"Analyze Data"}>
                        <LegacyCard.Section>
                            <ColumnChart
                                empty={"No data"}
                                label={"Analyze Data"}
                                data={formatted}
                            />
                        </LegacyCard.Section>
                    </LegacyCard>}
                    {!isCreate && <LegacyCard title={"Related products"}>
                        <LegacyCard.Section>
                            <VerticalStack gap={"2"}>
                            {!!selectedResource?.length &&
                                <HorizontalStack align={"end"}>
                                    <Button onClick={handleToggleResource}>Edit related products</Button>
                                </HorizontalStack>
                            }
                            <ResourcePicker
                                initialQuery={`${product?.productType?.length ? `product_type:${product?.productType} AND NOT id:${shopifyIdToNumber(product?.id)}` : ''}`}
                                initialSelectionIds={selectedIdsResource}
                                onSelection={handleSelectResource}
                                resourceType={'Product'}
                                open={resourceOpened}
                            />
                            <ResourceList
                                items={selectedResource}
                                renderItem={(item) => {
                                    const {id, images, title} = item;
                                    const src = images?.at(0)?.originalSrc ?? DEFAULT_IMAGE;
                                    const media = <Avatar size="medium" source={src} name={title}/>;

                                    return (
                                        <ResourceItem
                                            id={id}
                                            url={""}
                                            media={media}
                                            onClick={() => navigate(`${E_Routes.products}/${shopifyIdToNumber(id)}`)}
                                        >
                                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                {title}
                                            </Text>
                                        </ResourceItem>
                                    );
                                }}
                                emptyState={emptyStateMarkup}
                            />
                            </VerticalStack>
                        </LegacyCard.Section>
                    </LegacyCard>}
                </Layout.Section>
                <Layout.Section secondary>
                    <LegacyCard>
                        {status === E_STATUS_PRODUCTS.archived ? (
                            <LegacyCard.Section
                                title={
                                    <HorizontalStack gap={"2"}>
                                        <LegacyStack>
                                            <Icon source={ArchiveMinor}/>
                                        </LegacyStack>
                                        <Text as={"p"} variant={"bodyMd"} fontWeight={"bold"}>
                                            Archived
                                        </Text>
                                    </HorizontalStack>
                                }
                            >
                                <VerticalStack gap={"3"}>
                                    <Text as={"p"} variant={"bodyMd"}>
                                        Hidden from your Shopify admin, except your product list.
                                    </Text>
                                    <Box>
                                        <Button size={"medium"} onClick={handleOpenUnArchiveModal}>
                                            Unarchive product
                                        </Button>
                                    </Box>
                                </VerticalStack>
                            </LegacyCard.Section>
                        ) : (
                            <LegacyCard.Section>
                                <Select
                                    label="Status"
                                    options={getStatusList()}
                                    onChange={handleStatusChange}
                                    value={status}
                                />
                            </LegacyCard.Section>
                        )}
                    </LegacyCard>
                </Layout.Section>
            </Layout>
            <PageActions
                primaryAction={
                    <Button
                        loading={isLoading}
                        disabled={shouldDisable()}
                        onClick={handleSave}
                        primary
                    >
                        Save
                    </Button>
                }
                secondaryActions={
                    !isCreate ? (
                        <ButtonGroup>
                            {status !== E_STATUS_PRODUCTS.archived && (
                                <Button disabled={isLoading} onClick={handleOpenArchiveModal}>
                                    Archive product
                                </Button>
                            )}
                            <Button
                                disabled={isLoading}
                                onClick={handleOpenDeleteModal}
                                destructive
                            >
                                Delete product
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <></>
                    )
                }
            />
            {!isCreate && (
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
                </>
            )}
        </>
    );
};
