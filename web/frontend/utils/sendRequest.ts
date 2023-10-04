export type T_Fetch = (
  uri: RequestInfo,
  options?: RequestInit
) => Promise<Response>;

export async function sendRequest(fetch: T_Fetch, body: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body,
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  // @ts-ignore
  return (await response.json()).body;
}

export async function sendRequestGet(fetch: T_Fetch, params: string) {
  const response = await fetch(`/api/${params}`, {method: 'GET'});
  if (!response.ok) {
    throw new Error(await response.text());
  }
  // @ts-ignore
  return (await response.json());
}
