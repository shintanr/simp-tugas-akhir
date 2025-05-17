import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/provider/nextAuthProvider";
import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/provider/reduxProvider";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    template: "SI Praktikum | %s",
    default: "Dashboard", // a default is required when creating a template
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.className} antialiased`}>
        <NextAuthProvider>
          <ReduxProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                classNames: {
                  error:
                    "!bg-destructive !text-destructive-foreground !border-0 !text-white",
                  success: "!bg-green-600 !text-white !border-0",
                  loading: "!bg-primary !text-primary-foreground !border-0",
                  warning: "!bg-yellow-500 !text-white !border-0",
                },
              }}
            />
          </ReduxProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
