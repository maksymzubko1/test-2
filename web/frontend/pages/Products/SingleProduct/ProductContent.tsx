import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Box, Button,
    HorizontalStack, Icon,
    Label,
    Layout,
    LegacyCard, LegacyStack,
    Select,
    Text,
    TextField,
    VerticalStack
} from "@shopify/polaris";
import JoditEditor from "jodit-react";
import {capitalize} from "../../../utils/capitalize";
import {E_STATUS_PRODUCTS} from "../../../graphql/products/products.interfaces";
import {ArchiveModal} from "./Modals/ArchiveModal";
import {ArchiveMinor} from "@shopify/polaris-icons";

interface I_Props {
    product: any;
    refetch: () => Promise<any>;
}

export const ProductContent = ({product, refetch}: I_Props) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")
    const editor = useRef(null);
    const [status, setStatus] = useState("");
    const [unArchiveModalOpened, setUnArchiveModalOpened] = useState(false)

    useEffect(() => {
        if(product)
        {
            setStatus(product?.status);
            setTitle(product?.title);
            setDescription(product?.descriptionHtml);
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
    }, [product.status]);

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

    const validateTitle = useCallback(() => {
        if (!title || title.length === 0)
            return {isError: true, message: 'Title is required!'};
        if (title.length > 40)
            return {isError: true, message: 'Title max length - 40 symbols.'};
        return {isError: false}
    }, [title])
    const validateTitleResult = validateTitle();

    return (
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
                                error={validateTitleResult.isError ? validateTitleResult.message : false}
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
                                    <Button size={"medium"} onClick={handleOpenUnArchiveModal}>Unarchive product</Button>
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
            <ArchiveModal
                opened={unArchiveModalOpened}
                onClose={handleCloseUnArchiveModal}
                id={product.id.split("/").at(-1)}
                refetch={refetch}
                status={E_STATUS_PRODUCTS.draft}
            />
        </Layout>
    );
};
