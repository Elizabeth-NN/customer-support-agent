import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public" });



export const metadata: Metadata = {
  title: "rafikiSupport AI | The Intelligent Support Layer",
  description:
    "AI-powered customer support that resolves queries instantly and intelligently hands off complex issues to your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en">
        <body >{children}</body>
      </html>
    </ClerkProvider>
  );
}