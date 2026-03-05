import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const axiformaFont = Plus_Jakarta_Sans({
  variable: "--font-axiforma",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vocado CRM Dashboard",
  description: "Modern CRM Dashboard UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${axiformaFont.variable} font-sans antialiased flex flex-col min-h-screen bg-background text-foreground`}
          style={{ fontFamily: 'var(--font-axiforma), "Plus Jakarta Sans", sans-serif' }}
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
