import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Layout from "@/components/Layout";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  Hydrate,
} from "@tanstack/react-query";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <SessionProvider session={session}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}
