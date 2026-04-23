import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Patchly — The code review bot that actually helps.",
  description:
    "Reviews every PR in minutes. Flags the bugs, suggests the fix, and explains why — like a senior engineer on your team.",
  openGraph: {
    title: "Patchly — The code review bot that actually helps.",
    description:
      "Reviews every PR in minutes. Flags the bugs, suggests the fix, and explains why — like a senior engineer on your team.",
    images: [
      {
        url: "https://waitlist-api-sigma.vercel.app/api/og?title=Patchly&accent=stone&category=Dev%20tools",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patchly — The code review bot that actually helps.",
    description:
      "Reviews every PR in minutes. Flags the bugs, suggests the fix, and explains why — like a senior engineer on your team.",
    images: [
      "https://waitlist-api-sigma.vercel.app/api/og?title=Patchly&accent=stone&category=Dev%20tools",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-neutral-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
