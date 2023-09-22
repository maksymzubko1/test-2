import { type Session, GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify";

export async function sendReq(session: Session, params: any, query: string) {
  const client = new shopify.api.clients.Graphql({ session });

  const data: any = { query };
  if (params) data["variables"] = params;

  try {
    return await client.query({
      data,
    });
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
