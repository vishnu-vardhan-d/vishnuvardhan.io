import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vishnu Vardhan — Java and Spring AI",
  description:
    "Vishnu Vardhan builds enterprise systems and AI on the JVM with Java, Spring, Kafka and PostgreSQL.",
  metadataBase: new URL("https://vishnuvardhan.io"),
  openGraph: {
    title: "Vishnu Vardhan — Java and Spring AI",
    description: "Java, Spring, Kafka, PostgreSQL, and Spring AI.",
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
