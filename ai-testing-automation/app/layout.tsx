import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { ThemeProvider } from "@/components/custom/ThemeProvider";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TestAI — AI-Powered Testing Automation",
  description: "Generate, run, and manage intelligent test suites in seconds. Let AI handle the testing so your team can focus on building what matters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.className}>
        <body className={inter.className} style={{ margin: 0, padding: 0 }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <Provider>{children}</Provider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
