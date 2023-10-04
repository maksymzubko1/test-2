import {
  I_MutationProductArchive,
  I_MutationProductDelete,
  I_MutationProductDuplicate,
  I_MutationProductUpdate,
  I_ProductsGetDto,
} from "../../graphql/products/products.interfaces";
import {
  ARCHIVE_PRODUCT,
  CREATE_PRODUCT,
  DELETE_PRODUCT,
  DUPLICATE_PRODUCT,
  GET_PRODUCT,
  GET_PRODUCT_APPS,
  GET_PRODUCT_MARKETS,
  GET_PRODUCTS,
  UPDATE_PRODUCT,
} from "../../graphql/products/products.graphql";
import { I_Default } from "../../graphql/default.interface";
import {sendRequest, sendRequestGet, T_Fetch} from "../../utils/sendRequest";

export async function queryProductsMarketsGet(
  fetch: T_Fetch,
  data: I_ProductsGetDto
) {
  const body = {
    query: GET_PRODUCT_MARKETS,
    params: data,
  } as I_Default<I_ProductsGetDto>;
  return await sendRequest(fetch, JSON.stringify(body));
}

export async function queryProductsAppsGet(
  fetch: T_Fetch,
  data: I_ProductsGetDto
) {
  const body = {
    query: GET_PRODUCT_APPS,
    params: data,
  } as I_Default<I_ProductsGetDto>;
  return await sendRequest(fetch, JSON.stringify(body));
}

export async function queryProductsGet(fetch: T_Fetch, data: I_ProductsGetDto) {
  const body = {
    query: GET_PRODUCTS,
    params: data,
  } as I_Default<I_ProductsGetDto>;
  return await sendRequest(fetch, JSON.stringify(body));
}

export async function queryProductGet(fetch: T_Fetch, id: number) {
  const body = {
    query: GET_PRODUCT,
    params: { id: `gid://shopify/Product/${id}` },
  } as I_Default<{ id: string }>;
  return await sendRequest(fetch, JSON.stringify(body));
}

export async function getProductAnalyzeData(fetch: T_Fetch, id: number) {
  return await sendRequestGet(fetch, `analyze/${id}`);
}

export async function mutationProductCreate(
  fetch: T_Fetch,
  data: I_MutationProductUpdate
) {
  const body = {
    query: CREATE_PRODUCT,
    params: data,
  } as I_Default<I_MutationProductUpdate>;
  const response = await sendRequest(fetch, JSON.stringify(body));

  if (response?.data?.productCreate?.userErrors?.length)
    throw new Error(response?.data?.productCreate?.userErrors);

  return response;
}

export async function mutationProductUpdate(
  fetch: T_Fetch,
  data: I_MutationProductUpdate
) {
  const body = {
    query: UPDATE_PRODUCT,
    params: data,
  } as I_Default<I_MutationProductUpdate>;
  const response = await sendRequest(fetch, JSON.stringify(body));

  if (response?.data?.productUpdate?.userErrors?.length)
    throw new Error(response?.data?.productUpdate?.userErrors);

  return response;
}

export async function mutationProductStatus(
  fetch: T_Fetch,
  id: string,
  status: string
) {
  const body = {
    query: ARCHIVE_PRODUCT,
    params: {
      product: {
        id,
        status,
      },
    },
  } as I_Default<I_MutationProductArchive>;
  const response = await sendRequest(fetch, JSON.stringify(body));

  if (response?.data?.productDuplicate?.userErrors?.length)
    throw new Error(response?.data?.productDuplicate?.userErrors);

  return response;
}

export async function mutationProductDelete(fetch: T_Fetch, id: string) {
  const body = {
    query: DELETE_PRODUCT,
    params: {
      product: {
        id,
      },
    },
  } as I_Default<I_MutationProductDelete>;
  const response = await sendRequest(fetch, JSON.stringify(body));

  if (response?.data?.productDelete?.userErrors?.length)
    throw new Error(response?.data?.productDelete?.userErrors);

  return response;
}

export async function mutationProductDuplicate(
  fetch: T_Fetch,
  data: I_MutationProductDuplicate
) {
  const body = {
    query: DUPLICATE_PRODUCT,
    params: data,
  } as I_Default<I_MutationProductDuplicate>;
  const response = await sendRequest(fetch, JSON.stringify(body));

  if (response?.data?.productDelete?.userErrors?.length)
    throw new Error(response?.data?.productDelete?.userErrors);

  return response;
}
