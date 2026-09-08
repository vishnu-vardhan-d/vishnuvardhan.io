"use client";

import { useEffect, useState } from "react";
import styles from "./VisitCounter.module.css";

const ENDPOINT = process.env.NEXT_PUBLIC_VISITS_URL;

export default function VisitCounter() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    if (!ENDPOINT) return;
    // Count each browser session once; refreshes within a session don't inflate the number.
    const method = sessionStorage.getItem("counted") ? "GET" : "POST";
    fetch(ENDPOINT, { method })
      .then((r) => r.json())
      .then((d: { visits: number }) => {
        setVisits(d.visits);
        sessionStorage.setItem("counted", "1");
      })
      .catch(() => {});
  }, []);

  if (visits === null) return null;
  return (
    <p className={styles.count}>
      {visits.toLocaleString()} {visits === 1 ? "visit" : "visits"}
    </p>
  );
}
