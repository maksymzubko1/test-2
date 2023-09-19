import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, data) => {
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (result: { success: boolean; error: string }, data) => {
      if (!result || !result.success) {
      }
    },
    onError: (error, data) => {
    },
  }),
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
