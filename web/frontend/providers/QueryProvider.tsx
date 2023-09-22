import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.log("queryClientCacheError ", error);
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (result: { success: boolean; error: string }) => {
      if (!result || !result.success) {
        console.log("Failed mutation");
      }
    },
    onError: (error) => {
      console.log("queryClientMutationError ", error);
    },
  }),
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
