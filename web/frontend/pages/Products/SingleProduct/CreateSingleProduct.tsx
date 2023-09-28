import React from 'react';
import {E_Routes} from "../../../Routes";
import {Page} from '@shopify/polaris';
import {useNavigate} from "react-router-dom";
import {ProductContent} from "./ProductContent";

export const CreateSingleProduct = () => {
    const navigate = useNavigate();

    return (
        <Page
            fullWidth
            title={"Add product"}
            backAction={{
                onAction() {
                    navigate(E_Routes.products);
                },
            }}
        >
            <ProductContent product={null} isCreate={true}/>
        </Page>
    );
};