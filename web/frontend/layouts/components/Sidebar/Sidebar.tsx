import React from "react";
import { Box, Frame, Navigation } from "@shopify/polaris";
import { useLocation, useNavigate } from "react-router-dom";
import { HomeMinor, OrdersMinor } from "@shopify/polaris-icons";
import { ItemProps } from "@shopify/polaris/build/ts/src/components/Navigation/types";

import "./style.module.css";
import { E_Routes } from "../../../Routes";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order = parseInt(location.pathname.split("/").at(-1));
  const isSingleOrder = !Number.isNaN(order);

  const pages: ItemProps[] = [
    {
      selected: location.pathname === E_Routes.home,
      label: "Home",
      icon: HomeMinor,
      onClick: () => {
        navigate(E_Routes.home);
      },
    },
    {
      selected: location.pathname === E_Routes.orders,
      truncateText: true,
      label: "Orders",
      icon: OrdersMinor,
      onClick: () => {
        navigate(E_Routes.orders);
      },
    },
  ];

  const currentPage = !isSingleOrder
    ? []
    : [
        {
          selected: true,
          truncateText: true,
          label: `#${order}`,
          icon: OrdersMinor,
        },
      ];

  return (
    <Frame>
      <Box aria-details={"nav-bar"}>
        <Navigation location="/">
          <Navigation.Section items={pages} />
          {isSingleOrder && (
            <Navigation.Section title={"Opened order"} items={currentPage} />
          )}
        </Navigation>
      </Box>
    </Frame>
  );
};
