"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BinaryPortrait.module.css";

const COLS = 70;                 // characters across
const ASPECT = 0.55;             // monospace glyph width/height ratio
const ROW_MS = 28;               // print speed per row

// Brightness → glyph + tone. Dark pixels print as 1, mid as 0, light as space.
type Cell = { ch: string; tone: 0 | 1 | 2 | 3 };
function cell(lum: number): Cell {
  if (lum < 0.30) return { ch: "1", tone: 0 };
  if (lum < 0.50) return { ch: "1", tone: 1 };
  if (lum < 0.68) return { ch: "0", tone: 2 };
  if (lum < 0.80) return { ch: "0", tone: 3 };
  return { ch: " ", tone: 3 };
}

export default function BinaryPortrait({ src, alt }: { src: string; alt: string }) {
  const [rows, setRows] = useState<Cell[][]>([]);
  const [shown, setShown] = useState(0);
  const timer = useRef<number | null>(null);

  // 1. Sample the image once into a character grid.
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const rowsCount = Math.round(COLS * ASPECT * (img.height / img.width));
      const canvas = document.createElement("canvas");
      canvas.width = COLS;
      canvas.height = rowsCount;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, COLS, rowsCount);
      const { data } = ctx.getImageData(0, 0, COLS, rowsCount);
      const out: Cell[][] = [];
      for (let y = 0; y < rowsCount; y++) {
        const line: Cell[] = [];
        for (let x = 0; x < COLS; x++) {
          const i = (y * COLS + x) * 4;
          const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
          line.push(cell(lum));
        }
        out.push(line);
      }
      setRows(out);
    };
  }, [src]);

  // 2. Print it one row at a time, unless the reader prefers no motion.
  useEffect(() => {
    if (rows.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(rows.length); return; }
    let n = 0;
    timer.current = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= rows.length && timer.current) window.clearInterval(timer.current);
    }, ROW_MS);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [rows]);

  return (
    <pre className={styles.portrait} role="img" aria-label={alt}>
      {rows.map((line, y) => (
        <span key={y} className={y < shown ? undefined : styles.pending}>
          {line.map((c, x) => <span key={x} className={styles["t" + c.tone]}>{c.ch}</span>)}
          {y === shown - 1 && shown < rows.length && <span className={styles.cursor}>▍</span>}
          {"\n"}
        </span>
      ))}
    </pre>
  );
}
