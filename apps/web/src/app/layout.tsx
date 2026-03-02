import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TranslateKit — AI i18n for Indie SaaS",
    template: "%s | TranslateKit",
  },
  description:
    "Upload locale JSON, get 20+ languages instantly via AI. 1/7th the price of Phrase. Sync via Git webhook, serve via CDN API.",
  keywords: ["i18n", "translation", "localization", "AI", "SaaS", "indie"],
  authors: [{ name: "ThreeStack", url: "https://threestack.io" }],
  openGraph: {
    title: "TranslateKit — AI i18n for Indie SaaS",
    description: "Upload locale JSON, get 20+ languages instantly via AI.",
    url: "https://translatekit.threestack.io",
    siteName: "TranslateKit",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
