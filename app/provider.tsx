"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

interface Props {
  nonce?: string;
  withCache?: boolean;
  children: React.ReactNode;
}

export default function RootLayout(props: Props) {
  const { children, withCache, ...rest } = props;
  console.log("provider nonce", props.nonce);
  if (withCache !== true) {
    return <Provider {...rest}>{children}</Provider>;
  }

  return (
    <WithCacheProvider nonce={props.nonce}>
      <Provider {...rest}>{children}</Provider>
    </WithCacheProvider>
  );
}

function Provider(props: Props) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider
        nonce={props.nonce}
        attribute="class"
        disableTransitionOnChange
      >
        {props.children}
      </ThemeProvider>
    </ChakraProvider>
  );
}

export function WithCacheProvider({ nonce, children }: Props): JSX.Element {
  const cache = createCache({ nonce, key: "custom" });
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
