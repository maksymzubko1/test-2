import React from "react";

import "./style.css";
import { Badge, Box } from "@shopify/polaris";
import { capitalize } from "../../utils/capitalize";
import {
  Progress,
  Status,
} from "@shopify/polaris/build/ts/src/components/Badge/types";
import { E_ALL_STATUSES_ORDERS } from "../../graphql/orders/orders.interfaces";
import {
  MarkFulfilledMinor,
  MarkPaidMinor,
  PinMinor,
  UnfulfilledMajor,
} from "@shopify/polaris-icons";

function getStatusBadge(status: string, inOrder = false): Status {
  if (!inOrder) {
    switch (status.toLowerCase()) {
      case E_ALL_STATUSES_ORDERS.PAID:
        return "enabled-experimental";
      case E_ALL_STATUSES_ORDERS.EXPIRED:
        return "warning";
      case E_ALL_STATUSES_ORDERS.UNFULFILLED:
        return "attention";
      case E_ALL_STATUSES_ORDERS.FULFILLED:
        return "enabled-experimental";
      default:
        return "warning";
    }
  } else {
    switch (status.toLowerCase()) {
      case E_ALL_STATUSES_ORDERS.PAID:
        return "success";
      case E_ALL_STATUSES_ORDERS.EXPIRED:
        return "warning";
      case E_ALL_STATUSES_ORDERS.UNFULFILLED:
        return "attention";
      case E_ALL_STATUSES_ORDERS.FULFILLED:
        return "success";
      default:
        return "warning";
    }
  }
}

function getIconBadge(status: string) {
  switch (status.toLowerCase()) {
    case E_ALL_STATUSES_ORDERS.FULFILLED:
      return MarkFulfilledMinor;
    case E_ALL_STATUSES_ORDERS.UNFULFILLED:
      return UnfulfilledMajor;
    case E_ALL_STATUSES_ORDERS.PAID:
      return MarkPaidMinor;
    default:
      return PinMinor;
  }
}

function getProgressBadge(status: string): Progress {
  switch (status.toLowerCase()) {
    case E_ALL_STATUSES_ORDERS.FULFILLED:
      return "complete";
    case E_ALL_STATUSES_ORDERS.PAID:
      return "complete";
    case E_ALL_STATUSES_ORDERS.PARTIALLY_PAID:
      return "partiallyComplete";
    case E_ALL_STATUSES_ORDERS.PARTIALLY_FULFILLED:
      return "partiallyComplete";
    default:
      return "incomplete";
  }
}

interface I_Props {
  status: string;
  variant: "slim" | "large";
}

export const CustomBadge = ({ status, variant }: I_Props) => {
  return (
    <Box
      aria-details={`${variant === "large" ? "badge-icon-div" : ""}`}
      paddingBlockEnd={variant === "large" ? "12" : "0"}
    >
      {variant === "large" ? (
        <Badge
          icon={getIconBadge(status)}
          size={"large-experimental"}
          status={getStatusBadge(status, variant === "large")}
        >
          {capitalize(status)}
        </Badge>
      ) : (
        <Badge
          size={"large-experimental"}
          status={getStatusBadge(status)}
          progress={getProgressBadge(status)}
        >
          {capitalize(status)}
        </Badge>
      )}
    </Box>
  );
};
