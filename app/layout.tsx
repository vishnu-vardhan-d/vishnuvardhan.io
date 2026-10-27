import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vishnu Vardhan",
  description:
    "Software engineer working on systems architecture and AI on the JVM. Projects and articles by Vishnu Vardhan.",
  metadataBase: new URL("https://vishnuvardhan.io"),
  openGraph: {
    title: "Vishnu Vardhan",
    description: "Software engineer working on systems architecture and AI on the JVM.",
    url: "https://vishnuvardhan.io",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Cloudflare Web Analytics: cookieless page-view stats (countries, pages, referrers). */}
        <script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "76707937b9244ea6a6f296c02f869675"}'
        />
      </body>
    </html>
  );
}
