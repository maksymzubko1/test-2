import React, { useEffect } from "react";
import { Page, Spinner, Text } from "@shopify/polaris";
import { useAuthenticatedFetch } from "../../../hooks";
import { useQuery } from "@tanstack/react-query";
import { GET_ORDER } from "../../../graphql/orders/orders.graphql";
import { I_Default } from "../../../graphql/default.interface";
import { useToast } from "@shopify/app-bridge-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./style.css";
import { E_Routes } from "../../../Routes";
import { OrderContent } from "./OrderContent";

function useGetOrder(id: number) {
  const fetch = useAuthenticatedFetch();

  return useQuery([id], async () => {
    const body = {
      query: GET_ORDER,
      params: { id: `gid://shopify/Order/${id}` },
    } as I_Default<{ id: string }>;

    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.log("not ok", await res.text());
      throw new Error(await res.text());
    }
    // @ts-ignore
    return (await res.json()).body;
  });
}

export const SingleOrder = () => {
  const location = useLocation();
  const id = parseInt(location.pathname.split("/").at(-1));
  const navigate = useNavigate();

  if (isNaN(id))
    return (
      <Page
        fullWidth
        backAction={{
          onAction() {
            navigate(E_Routes.orders);
          },
        }}
      >
        <Text fontWeight={"bold"} variant={"heading4xl"} as={"h1"}>
          Invalid id
        </Text>
      </Page>
    );

  const { data, isLoading, isError } = useGetOrder(id);
  const { show: showToast } = useToast();

  useEffect(() => {
    if (isError || (!isLoading && !data?.data?.order))
      showToast("Error fetch this order", { isError: true });
  }, [isError, isLoading]);

  const { order } = data?.data ?? {};

  return (
    <Page
      fullWidth
      backAction={{
        onAction() {
          navigate(E_Routes.orders);
        },
      }}
    >
      {isLoading && <Spinner />}
      {!isLoading && (isError || !data?.data?.order) && (
        <Text fontWeight={"bold"} variant={"heading4xl"} as={"h1"}>
          Cannot fetch this order
        </Text>
      )}
      {!isLoading && !(isError || !data?.data?.order) && (
        <OrderContent order={order} />
      )}
    </Page>
  );
};
