import React from 'react';
import './style.module.css'
import {Box, Text} from "@shopify/polaris";

interface I_Props {
    status: string
}

export const FinancialStatus = ({status}:I_Props) => {
    return (
        <Box borderRadius={"500"} id={"status_box"} padding={"2"} aria-details={status.toLowerCase()}>
            <Text as={"span"} variant={"bodyMd"} fontWeight={"bold"} color={"text-inverse"} alignment={"center"}>
            {status}
            </Text>
        </Box>
    );
};

