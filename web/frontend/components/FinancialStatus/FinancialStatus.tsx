import React from 'react';
import './style.module.css'
import {Box, HorizontalStack, Icon, Text} from "@shopify/polaris";

interface I_Props {
    status: string
    Icon?: any
}

export const FinancialStatus = ({status, Icon}:I_Props) => {
    return (
        <Box borderRadius={"500"} id={"status_box"} padding={"2"} aria-details={status.toLowerCase()}>
            <Text as={"span"} variant={"bodyMd"} fontWeight={"bold"} color={"text-inverse"} alignment={"center"}>
                <HorizontalStack gap={"1"} blockAlign={"start"}>
                {Icon && <Icon/>}
                {status.toLowerCase()}
                </HorizontalStack>
            </Text>
        </Box>
    );
};

