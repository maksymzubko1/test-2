import React, { useEffect, useState } from "react";
import { Page, Text, VerticalStack } from "@shopify/polaris";
import { useAuthenticatedFetch } from "../../hooks";
import { useQuery } from "@tanstack/react-query";
import { E_SORT_ORDERS, I_OrdersGetDto } from "../../graphql/orders/orders.interfaces";
import OrdersTable from "./OrdersTable";
import { useToast } from "@shopify/app-bridge-react";
import {queryOrdersGet} from "./requests";

function useGetOrders(data: I_OrdersGetDto) {
  const fetch = useAuthenticatedFetch();

  return useQuery([Object.entries(data)], async () => {
    return await queryOrdersGet(fetch,data);
  });
}

export const Orders = () => {
  const [options, setOptions] = useState<I_OrdersGetDto>({
    sort: E_SORT_ORDERS.createdAt,
    first: 3,
    reverse: false,
  });
  const { data, isLoading, isError } = useGetOrders(options);
  const { show: showToast } = useToast();

  useEffect(() => {
    if (isError) showToast("Error fetch orders list", { isError: true });
  }, [isError]);

  const onChange = (options: I_OrdersGetDto) => {
    setOptions(options);
  };

  return (
    <Page fullWidth>
      <VerticalStack gap={"12"}>
        <VerticalStack gap={"2"}>
          <Text fontWeight={"bold"} as={"h1"} variant={"heading4xl"}>
            Orders
          </Text>
          <Text fontWeight={"regular"} as={"p"} variant={"bodyLg"}>
            Track your orders
          </Text>
        </VerticalStack>
        <OrdersTable data={data} isLoading={isLoading} onRequest={onChange} />
      </VerticalStack>
    </Page>
  );
};
