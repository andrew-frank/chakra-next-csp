import { Inter } from "next/font/google";
import Provider from "./provider";
import { headers } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = headers().get("x-nonce") ?? undefined;
  console.log("layout nonce", nonce);
  const withCache = false;
  console.log("with cache", withCache);
  return (
    <html className={inter.className} suppressHydrationWarning>
      <head />
      <body>
        <Provider withCache={withCache} nonce={nonce}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
