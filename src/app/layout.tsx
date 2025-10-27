import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/components/providers/convex-provider";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "SinterklaasGPT - AI Hulpmiddelen voor Sinterklaas",
  description: "Genereer gedichten, cadeautips, verrassingen en meer voor het Sinterklaasfeest met AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ConvexProvider>{children}</ConvexProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
