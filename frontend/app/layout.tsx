import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/contexts/Providers";
import { Header } from "@/components/layout/Header";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { APP_NAME } from "@/lib/utils/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Compete with friends in fantasy prediction markets. Make predictions, stake crypto, and win the pot!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <ConnectWallet />
        </Providers>
      </body>
    </html>
  );
}
