import React, { useEffect } from "react";
import { Page, Spinner, Text } from "@shopify/polaris";
import { useAuthenticatedFetch } from "../../../hooks";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@shopify/app-bridge-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./style.css";
import { E_Routes } from "../../../Routes";
import { OrderContent } from "./OrderContent";
import { queryOrderGet } from "../requests";

function useGetOrder(id: number) {
  const fetch = useAuthenticatedFetch();

  return useQuery([id], async () => {
    return await queryOrderGet(fetch, id);
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
