import React, {useEffect, useState} from 'react';
import {Box, Frame, Navigation} from "@shopify/polaris";
import {useLocation, useNavigate} from "react-router-dom";
import {HomeMinor, OrdersMinor, ProductsMinor} from "@shopify/polaris-icons";
import {ItemProps} from '@shopify/polaris/build/ts/src/components/Navigation/types';

import './style.module.css'

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const order = parseInt(location.pathname.split('/').at(-1));
    const isSingleOrder = !Number.isNaN(order);

    const pages: ItemProps[] = [
        {
            selected: location.pathname === '/', label: 'Home', icon: HomeMinor, onClick: () => {
                navigate("/")
            }
        },
        {
            selected: location.pathname === "/orders",
            truncateText: true,
            label: 'Orders',
            icon: OrdersMinor,
            onClick: () => {
                navigate("/orders")
            },
        },
    ]

    const currentPage = !isSingleOrder ? [] : [
        {
            selected: true,
            truncateText: true,
            label: `#${order}`,
            icon: OrdersMinor
        },
    ]

    return (
        <Frame sidebar>
            <Box aria-details={"nav-bar"}>
                <Navigation location="/">
                    <Navigation.Section
                        items={pages}
                    />
                    {isSingleOrder && <Navigation.Section title={"Opened order"} items={currentPage}/>}
                </Navigation>
            </Box>
        </Frame>
    );
}
    ;