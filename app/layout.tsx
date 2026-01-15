import React from "react";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import NavBar from "@/components/NavBar";
import { SessionProvider } from "next-auth/react";
import BtmNav from "@/components/BtmNav";
import ScrollTop from "@/components/ScrollTop";

const roboto = Nunito({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPS-Admin",
  description: "SPS-Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.className} antialiased text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ScrollTop />
            <main className="w-full grow min-h-screen mb-8">
              <NavBar />
              <Toaster position="top-center" expand />
              <div className="pt-0.5"></div>
              {children}
            </main>
            <BtmNav />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
