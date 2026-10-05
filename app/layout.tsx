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
      <body>{children}</body>
    </html>
  );
}
