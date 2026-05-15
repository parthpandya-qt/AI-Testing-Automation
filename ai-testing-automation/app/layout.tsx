import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";

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
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }}>
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
    
  );
}
