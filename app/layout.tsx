import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vishnu Vardhan — Java engineer",
  description:
    "Vishnu Vardhan is a senior Java engineer building AI systems on Spring, Kafka and PostgreSQL, with thirteen years across state-scale public systems and start-ups.",
  metadataBase: new URL("https://vishnuvardhan.io"),
  openGraph: {
    title: "Vishnu Vardhan — Java engineer",
    description: "Senior Java engineer. Spring, Kafka, PostgreSQL, and now Spring AI.",
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
