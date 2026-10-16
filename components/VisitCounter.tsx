"use client";

import { useEffect, useState } from "react";
import styles from "./VisitCounter.module.css";

const ENDPOINT = process.env.NEXT_PUBLIC_VISITS_URL || "https://visits.vishnuvardhan.io";

// Owner opt-out: open vishnuvardhan.io/?me once in each of your own browsers and
// that browser is never counted again. vishnuvardhan.io/?me=off undoes it.
function shouldCount(): boolean {
  try {
    const params = new URLSearchParams(location.search);
    if (params.has("me")) {
      if (params.get("me") === "off") localStorage.removeItem("owner");
      else localStorage.setItem("owner", "1");
      params.delete("me");
      const query = params.toString();
      history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);
    }
    if (location.hostname !== "vishnuvardhan.io") return false; // local dev and previews
    if (localStorage.getItem("owner")) return false;            // your own browsers
    if (localStorage.getItem("counted")) return false;          // already counted once
    return true;
  } catch {
    return false;
  }
}

export default function VisitCounter() {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    const count = shouldCount();
    fetch(ENDPOINT, { method: count ? "POST" : "GET" })
      .then((r) => r.json())
      .then((d: { visits: number }) => {
        setVisitors(d.visits);
        if (count) localStorage.setItem("counted", "1");
      })
      .catch(() => {});
  }, []);

  if (visitors === null) return null;
  return (
    <p className={styles.count}>
      {visitors.toLocaleString()} {visitors === 1 ? "visitor" : "visitors"}
    </p>
  );
}
