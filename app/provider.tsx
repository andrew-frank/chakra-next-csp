"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";

interface Props {
  nonce?: string;
  children: React.ReactNode;
}

export default function RootLayout(props: Props) {
  console.log('provider nonce', props.nonce)
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider nonce={props.nonce} attribute="class" disableTransitionOnChange>
        {props.children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
