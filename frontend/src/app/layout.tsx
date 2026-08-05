import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayoutWrapper } from "@/components/layout/app-layout-wrapper";
import { ProgramProvider } from "@/context/ProgramContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "InterviewAI | Practice Like It's Your Real Interview",
  description: "AI-powered technical interview preparation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-sans bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <ProgramProvider>
            <AppLayoutWrapper>
              {children}
            </AppLayoutWrapper>
          </ProgramProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
