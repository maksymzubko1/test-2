import React from 'react';
import {Icon, Text} from "@shopify/polaris";
import cl from './style.module.css'
import {
    FirstOrderMajor
} from '@shopify/polaris-icons';

export const Header = () => {
    return (
        <div className={cl.header_container}>
            <div className={cl.header_logo}>
                <Icon source={FirstOrderMajor} color={"success"}/>
                <Text as={"h2"}>
                    Orders App
                </Text>
            </div>
        </div>
    );
};