import React, { useCallback, useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../../hooks";
import { useQuery } from "@tanstack/react-query";
// @ts-ignore
import { LineChart, ColumnChart } from "react-chartkick";
import "chartkick/chart.js";
import { BarChartIcon, LineChartIcon } from "../../assets/svg-components";
import {
  Box,
  HorizontalStack,
  IndexTable,
  LegacyCard,
  Page,
  Text,
  Tooltip,
  VerticalStack,
} from "@shopify/polaris";
import { Link } from "react-router-dom";

import "./style.module.css";
import { useToast } from "@shopify/app-bridge-react";
import { shopifyIdToNumber } from "../../utils/shopifyIdToNumber";
import { queryOrdersMonthGet, queryTop5OrdersGet } from "./requests";

function useOrders() {
  const fetch = useAuthenticatedFetch();
  return useQuery(["orders"], async () => {
    return await queryOrdersMonthGet(fetch);
  });
}

function useTopOrders() {
  const fetch = useAuthenticatedFetch();
  return useQuery(["top_orders"], async () => {
    return await queryTop5OrdersGet(fetch);
  });
}

export const Home = () => {
  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
  } = useOrders();
  const {
    data: ordersTop,
    isLoading: isLoadingTop,
    isError: isErrorTop,
  } = useTopOrders();
  const [formatted, setFormatted] = useState([]);
  const [chart, setChart] = useState<"line" | "bar">("line");
  const { show: showToast } = useToast();

  useEffect(() => {
    if (orders && !isErrorOrders) {
      const dateCounts: any = {};

      // @ts-ignore
      orders?.forEach((order) => {
        const createdAt = new Date(order.createdAt);
        const date = createdAt.toISOString().split("T")[0];

        if (dateCounts[date]) {
          dateCounts[date]++;
        } else {
          dateCounts[date] = 1;
        }
      });

      setFormatted(dateCounts);
    }
  }, [orders, isErrorOrders]);

  useEffect(() => {
    if (isErrorOrders) showToast("Error fetch orders list", { isError: true });

    if (isErrorTop) showToast("Error fetch top orders", { isError: true });
  }, [isErrorOrders, isErrorTop]);

  const rowMarkup = useCallback(() => {
    return ordersTop ? (
      ordersTop.map((o: any, index: number) => (
        <IndexTable.Row id={o.id} key={o.id} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              <Link to={`/orders/${shopifyIdToNumber(o.id)}`}>{o.name}</Link>
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"center"}>
              $ {o.totalPriceSet?.shopMoney?.amount}
            </Text>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))
    ) : (
      <></>
    );
  }, [ordersTop]);

  const handleClickChart = () => {
    setChart("line");
  };

  const handleClickBar = () => {
    setChart("bar");
  };

  return (
    <Page fullWidth>
      <VerticalStack gap={"10"}>
        <VerticalStack gap={"8"}>
          <Text variant={"heading4xl"} as={"h1"}>
            Welcome back!
          </Text>
          <LegacyCard sectioned>
            <HorizontalStack align={"space-between"} blockAlign={"center"}>
              <Text as={"h2"} variant={"headingLg"}>
                Orders
              </Text>
              <Box
                borderRadius={"500"}
                as={"div"}
                padding={"2"}
                paddingBlockStart={"1"}
                paddingBlockEnd={"1"}
                borderColor={"border-input-active-experimental"}
                borderWidth={"1"}
                aria-details={chart === "line" ? "first" : "second"}
                position={"relative"}
              >
                <HorizontalStack
                  align={"center"}
                  blockAlign={"center"}
                  gap={"2"}
                >
                  <Box
                    as={"span"}
                    width={"28px"}
                    minHeight={"28px"}
                    borderRadius={"500"}
                    aria-details={"selector"}
                  />
                  <Tooltip content={"Line chart"}>
                    <span aria-details={"span-ico"} onClick={handleClickChart}>
                      <LineChartIcon />
                    </span>
                  </Tooltip>
                  <Tooltip content={"Bar chart"}>
                    <span aria-details={"span-ico"} onClick={handleClickBar}>
                      <BarChartIcon />
                    </span>
                  </Tooltip>
                </HorizontalStack>
              </Box>
              {chart === "line" ? (
                <LineChart
                  empty={"No data"}
                  label={"Orders"}
                  data={formatted}
                />
              ) : (
                <ColumnChart
                  empty={isLoadingTop ? "Loading data..." : "No data"}
                  label={"Orders"}
                  data={formatted}
                />
              )}
            </HorizontalStack>
          </LegacyCard>
        </VerticalStack>
        <VerticalStack gap={"4"}>
          <Text as={"h2"} variant={"headingXl"}>
            Top 5 Orders
          </Text>
          <LegacyCard>
            <IndexTable
              selectable={false}
              headings={[
                { title: "Order Name", alignment: "start" },
                { title: "Total Price", alignment: "center" },
              ]}
              // resourceName={{singular: 'order', plural: 'orders'}}
              emptyState={
                <Text as={"h1"} variant={"headingMd"}>
                  {isLoadingOrders ? "Loading data..." : "No data found."}
                </Text>
              }
              itemCount={ordersTop?.length ?? 0}
              // lastColumnSticky={true}
            >
              {rowMarkup()}
            </IndexTable>
          </LegacyCard>
        </VerticalStack>
      </VerticalStack>
    </Page>
  );
};
