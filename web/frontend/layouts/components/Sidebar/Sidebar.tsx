import React from 'react';
import {Frame, Navigation} from "@shopify/polaris";
import {useLocation, useNavigate} from "react-router-dom";
import {HomeMinor, OrdersMinor} from "@shopify/polaris-icons";

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const pages = [
        {selected: location.pathname === '/', label: 'Home', icon: HomeMinor, onClick: ()=>{navigate("/")}},
        {selected: location.pathname === "/orders", label: 'Orders', icon: OrdersMinor, onClick: ()=>{navigate("/orders")}},
    ]

    return (
        <Frame>
            <Navigation location="/">
                <Navigation.Section
                    items={pages}
                />
            </Navigation>
        </Frame>
    );
};