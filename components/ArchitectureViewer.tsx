"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ArchitectureViewer.module.css";
import type { ArchProject, ArchView, ArchNode } from "@/content/architecture";

const STEP_MS = 7000; // autoplay: time on each step
const HOP_MS = 1100;  // packet: time to cross one edge

export default function ArchitectureViewer({ project }: { project: ArchProject }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  return (
    <>
      <button ref={trigger} type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        View architecture <span aria-hidden="true">→</span>
      </button>
      {open && createPortal(<Overlay project={project} onClose={close} />, document.body)}
    </>
  );
}

function Overlay({ project, onClose }: { project: ArchProject; onClose: () => void }) {
  const tabs = [...project.views.map((v) => v.tab), "Design decisions"];
  const [tab, setTab] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const view: ArchView | null = tab < project.views.length ? project.views[tab] : null;
  const total = view ? view.steps.length : 0;

  const go = useCallback((n: number) => setStep(() => (total ? (n + total) % total : 0)), [total]);
  const hold = () => setPlaying(false);

  // Lock the page behind the overlay and start keyboard focus inside it.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!view) return;
      if (e.key === "ArrowRight") { setPlaying(false); setStep((s) => (s + 1) % total); }
      if (e.key === "ArrowLeft") { setPlaying(false); setStep((s) => (s - 1 + total) % total); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, view, total]);

  useEffect(() => {
    if (!playing || !view) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % total), STEP_MS);
    return () => window.clearInterval(t);
  }, [playing, view, total]);

  const pickTab = (i: number) => { setTab(i); setStep(0); setPlaying(true); };
  const current = view?.steps[step];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`${project.name} architecture`}>
      <header className={styles.bar}>
        <div className={styles.brand}>
          <span className={styles.name}>{project.name}</span>
          <span className={styles.tagline}>{project.tagline}</span>
        </div>
        <button ref={closeBtn} type="button" className={styles.close} onClick={onClose} aria-label="Close architecture">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>

      <nav className={styles.tabs} aria-label="Diagrams">
        {tabs.map((t, i) => (
          <button key={t} type="button" aria-pressed={i === tab} className={i === tab ? styles.tabOn : styles.tab} onClick={() => pickTab(i)}>
            {t}
          </button>
        ))}
      </nav>

      {view && current ? (
        <div className={styles.body}>
          <aside className={styles.panel}>
            <p className={styles.intro}>{view.intro}</p>
            <ol className={styles.stepList}>
              {view.steps.map((s, i) => (
                <li key={s.title}>
                  <button type="button" className={i === step ? styles.stepOn : styles.stepBtn} onClick={() => { hold(); setStep(i); }}>
                    <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <section className={styles.stage}>
            <div className={styles.head} key={`${tab}-${step}`}>
              <p className={styles.count}>Step {step + 1} of {total}</p>
              <h3 className={styles.title}>{current.title}</h3>
              <p className={styles.text}>{current.body}</p>
              <pre className={styles.code}><code>{current.code}</code></pre>
            </div>

            <div className={styles.canvas}>
              <Diagram view={view} step={step} />
            </div>

            <div className={styles.controls}>
              <button type="button" className={styles.nav} onClick={() => { hold(); go(step - 1); }} aria-label="Previous step">←</button>
              <div className={styles.dots}>
                {view.steps.map((s, i) => (
                  <button key={s.title} type="button" aria-label={`Step ${i + 1}`} className={i === step ? styles.dotOn : styles.dot} onClick={() => { hold(); setStep(i); }} />
                ))}
              </div>
              <button type="button" className={styles.nav} onClick={() => { hold(); go(step + 1); }} aria-label="Next step">→</button>
              <button type="button" className={styles.play} onClick={() => setPlaying((p) => !p)}>{playing ? "pause" : "play"}</button>
            </div>
          </section>
        </div>
      ) : (
        <div className={styles.decisions}>
          {project.decisions.map((d, i) => (
            <article key={d.q} className={styles.decision}>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.q}</h3>
              <p>{d.a}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- diagram */

function Diagram({ view, step }: { view: ArchView; step: number }) {
  const svg = useRef<SVGSVGElement>(null);
  const packet = useRef<SVGCircleElement>(null);
  const s = view.steps[step];
  const active = new Set(s.nodes);
  const travelled = new Set(s.path.map(([id]) => id));
  const isStateView = view.nodes.some((n) => n.kind === "state");

  // Move the packet along this step's edges, in order, then loop.
  useEffect(() => {
    const dot = packet.current;
    const root = svg.current;
    if (!dot || !root) return;
    const hops = s.path
      .map(([id, back]) => ({ el: root.querySelector<SVGPathElement>(`[data-edge="${id}"]`), back: !!back }))
      .filter((h): h is { el: SVGPathElement; back: boolean } => h.el !== null);
    if (!hops.length || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dot.style.opacity = "0";
      return;
    }
    dot.style.opacity = "1";
    let raf = 0;
    let hop = 0;
    let t0: number | null = null;
    const frame = (ts: number) => {
      if (t0 === null) t0 = ts;
      const { el, back } = hops[hop];
      const raw = Math.min((ts - t0) / HOP_MS, 1);
      const p = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const len = el.getTotalLength();
      const pt = el.getPointAtLength((back ? 1 - p : p) * len);
      dot.setAttribute("cx", String(pt.x));
      dot.setAttribute("cy", String(pt.y));
      if (raw >= 1) {
        hop += 1;
        t0 = ts;
        if (hop >= hops.length) { hop = 0; t0 = ts + 450; }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [s]);

  const [w, h] = view.viewBox;
  return (
    <svg ref={svg} className={styles.diagram} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${view.tab} diagram`}>
      <Defs />
      {view.groups.map((g) => (
        <g key={g.label} className={g.solid ? styles.groupSolid : styles.group}>
          <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={12} />
          <text x={g.x + 18} y={g.y + 27}>
            {g.label}
            {g.sub && <tspan className={styles.groupSub} dx={12}>{g.sub}</tspan>}
          </text>
        </g>
      ))}
      {view.edges.map((e) => (
        <path
          key={e.id}
          data-edge={e.id}
          d={e.d}
          className={travelled.has(e.id) ? styles.edgeOn : styles.edge}
          markerEnd={isStateView ? (travelled.has(e.id) ? "url(#ax-arrow-on)" : "url(#ax-arrow)") : undefined}
        />
      ))}
      {view.pills.map((p) => {
        const pw = p.text.length * 6.7 + 20;
        return (
          <g key={`${p.x}-${p.y}`} className={styles.pill}>
            <rect x={p.x - pw / 2} y={p.y - 11} width={pw} height={22} rx={11} />
            <text x={p.x} y={p.y + 4}>{p.text}</text>
          </g>
        );
      })}
      {view.nodes.map((n) => (
        <Node key={n.id} node={n} dim={!active.has(n.id)} />
      ))}
      <circle ref={packet} className={styles.packet} r={5.5} cx={-20} cy={-20} />
    </svg>
  );
}

function Node({ node, dim }: { node: ArchNode; dim: boolean }) {
  const cls = `${styles.node} ${dim ? styles.dim : ""}`;
  if (node.kind === "state") {
    const tone = node.tone === "end" ? styles.stateEnd : node.tone === "warn" ? styles.stateWarn : "";
    return (
      <g className={`${cls} ${styles.state} ${tone}`} transform={`translate(${node.x} ${node.y})`}>
        <rect x={-75} y={-28} width={150} height={56} rx={14} />
        <text className={styles.stateTitle} y={-3}>{node.title}</text>
        <text className={styles.stateSub} y={15}>{node.sub}</text>
      </g>
    );
  }
  return (
    <g className={cls} transform={`translate(${node.x} ${node.y})`}>
      <ellipse className={styles.shadow} cx={0} cy={34} rx={40} ry={11} />
      <use href={`#ax-${node.icon}`} x={-48} y={-54} width={96} height={96} className={styles.icon} />
      <text className={styles.nodeTitle} y={66}>{node.title}</text>
      <text className={styles.nodeSub} y={85}>{node.sub}</text>
    </g>
  );
}

/* Line-art icons, drawn on a 100 × 100 grid. Fill uses the canvas colour so overlapping lines stay clean. */
function Defs() {
  const line = { fill: "var(--ax-bg)", stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" as const };
  return (
    <defs>
      <marker id="ax-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--ax-faint)" />
      </marker>
      <marker id="ax-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--ax-accent)" />
      </marker>
      <g id="ax-slab">
        <path d="M50 20 L85 37 L50 54 L15 37 Z" />
        <path d="M15 37 V46 L50 63 V54 M85 37 V46 L50 63" />
      </g>
      <symbol id="ax-server" viewBox="0 0 100 100"><g {...line}>
        <use href="#ax-slab" y={30} /><use href="#ax-slab" y={15} /><use href="#ax-slab" y={0} />
        <g fill="currentColor" stroke="none"><circle cx={21} cy={46} r={1.4} /><circle cx={21} cy={61} r={1.4} /><circle cx={21} cy={76} r={1.4} /></g>
      </g></symbol>
      <symbol id="ax-log" viewBox="0 0 100 100"><g {...line}>
        <g transform="translate(0 8)"><path d="M10 50 L60 25 L90 40 L40 65 Z" /><path d="M10 50 V58 L40 73 V65 M40 73 L90 48 V40" />
          <path d="M22.5 43.8 L52.5 58.8 M35 37.5 L65 52.5 M47.5 31.3 L77.5 46.3" fill="none" /></g>
        <g transform="translate(0 -10)"><path d="M10 50 L60 25 L90 40 L40 65 Z" /><path d="M10 50 V58 L40 73 V65 M40 73 L90 48 V40" />
          <path d="M22.5 43.8 L52.5 58.8 M35 37.5 L65 52.5" fill="none" />
          <path d="M47.5 31.3 L60 25 L90 40 L77.5 46.3 Z" fill="var(--ax-accent)" fillOpacity={0.3} stroke="var(--ax-accent)" /></g>
      </g></symbol>
      <symbol id="ax-cube" viewBox="0 0 100 100"><g {...line}>
        <path d="M50 16 L82 32 L50 48 L18 32 Z" />
        <path d="M18 32 V64 L50 80 V48 M50 80 L82 64 V32" />
        <path d="M58 56 L64 53 M58 62 L72 55 M58 68 L68 63" fill="none" stroke="var(--ax-accent)" />
        <path d="M50 26 l3 4 l4 2 l-4 2 l-3 4 l-3 -4 l-4 -2 l4 -2 Z" fill="currentColor" stroke="none" />
      </g></symbol>
      <symbol id="ax-chip" viewBox="0 0 100 100"><g {...line}>
        <path d="M14 46 V54 L50 72 L86 54 V46" />
        <path d="M50 28 L86 46 L50 64 L14 46 Z" />
        <path d="M50 36 L70 46 L50 56 L30 46 Z" />
        <path d="M50 40 l2.5 4 l5 2 l-5 2 l-2.5 4 l-2.5 -4 l-5 -2 l5 -2 Z" fill="var(--ax-accent)" stroke="none" />
        <path d="M20 56 v6 M26 59 v6 M32 62 v6 M38 65 v6 M44 68 v6 M56 68 v6 M62 65 v6 M68 62 v6 M74 59 v6 M80 56 v6" fill="none" />
      </g></symbol>
      <symbol id="ax-db" viewBox="0 0 100 100"><g {...line}>
        <path d="M22 26 V72 A28 11 0 0 0 78 72 V26" />
        <ellipse cx={50} cy={26} rx={28} ry={11} />
        <path d="M22 41 A28 11 0 0 0 78 41 M22 56 A28 11 0 0 0 78 56" fill="none" />
      </g></symbol>
      <symbol id="ax-window" viewBox="0 0 100 100"><g {...line}>
        <rect x={14} y={22} width={72} height={56} rx={5} />
        <path d="M14 34 H86" fill="none" />
        <g fill="currentColor" stroke="none"><circle cx={21} cy={28} r={1.6} /><circle cx={27} cy={28} r={1.6} /><circle cx={33} cy={28} r={1.6} /></g>
        <path d="M24 46 H62 M24 55 H54 M24 64 H66" fill="none" stroke="var(--ax-accent)" />
      </g></symbol>
      <symbol id="ax-cloud" viewBox="0 0 100 100"><g {...line}>
        <path d="M30 70 H72 A14 14 0 0 0 74 42 A20 20 0 0 0 36 36 A16 16 0 0 0 30 70 Z" />
        <path d="M34 57 H66 M60 51 L66 57 L60 63" fill="none" stroke="var(--ax-accent)" />
      </g></symbol>
      <symbol id="ax-board" viewBox="0 0 100 100"><g {...line}>
        <rect x={12} y={20} width={76} height={60} rx={5} />
        <path d="M37 20 V80 M63 20 V80" fill="none" />
        <rect x={17} y={28} width={15} height={9} rx={2} /><rect x={17} y={41} width={15} height={9} rx={2} />
        <rect x={42} y={28} width={16} height={9} rx={2} fill="var(--ax-accent)" fillOpacity={0.3} stroke="var(--ax-accent)" />
        <rect x={68} y={28} width={15} height={9} rx={2} />
      </g></symbol>
      <symbol id="ax-plug" viewBox="0 0 100 100"><g {...line}>
        <path d="M40 20 V34 M60 20 V34" fill="none" />
        <rect x={30} y={34} width={40} height={26} rx={6} />
        <path d="M50 60 V70 C50 78 60 80 66 80 H82" fill="none" />
        <path d="M40 47 H60" fill="none" stroke="var(--ax-accent)" />
      </g></symbol>
      <symbol id="ax-gpu" viewBox="0 0 100 100"><g {...line}>
        <rect x={10} y={30} width={80} height={38} rx={4} />
        <circle cx={36} cy={49} r={12} />
        <path d="M36 37 V61 M24 49 H48" fill="none" />
        <path d="M58 41 H80 M58 49 H80 M58 57 H74" fill="none" stroke="var(--ax-accent)" />
        <path d="M20 68 V75 M28 68 V75 M36 68 V75 M44 68 V75 M52 68 V75" fill="none" />
      </g></symbol>
    </defs>
  );
}
