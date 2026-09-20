import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { num } from "./github";

const EASE = [0.22, 1, 0.36, 1] as const;

/** words rise into place one after another (word level only: arabic letters must stay joined) */
export function SplitWords({
  text,
  className,
  delay = 0,
  mode = "view",
}: {
  text: string;
  className?: string;
  delay?: number;
  mode?: "view" | "mount";
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="w">
            <motion.span
              initial={reduced ? false : { y: "110%", opacity: 0 }}
              {...(mode === "mount" ? { animate: { y: 0, opacity: 1 } } : { whileInView: { y: 0, opacity: 1 }, viewport: { once: true, margin: "-40px" } })}
              transition={{ duration: 0.65, delay: delay + i * 0.055, ease: EASE }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/** cycles through words with a blur/slide transition; sizes itself to the longest word */
export function RotatingWord({ words, interval = 3400, className = "" }: { words: string[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduced]);

  return (
    <span className={`rotator ${className}`}>
      {words.map((w) => (
        <span key={w} className="rotator-sizer" aria-hidden="true">
          {w}
        </span>
      ))}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          className="rotator-word"
          initial={reduced ? false : { y: "45%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? undefined : { y: "-45%", opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** types lines out one character at a time, then loops */
export function Typewriter({ lines, speed = 26, linePause = 650, loopPause = 3500 }: { lines: string[]; speed?: number; linePause?: number; loopPause?: number }) {
  const reduced = useReducedMotion();
  const [done, setDone] = useState<string[]>(reduced ? lines : []);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    if (reduced) return;
    let line = 0;
    let ch = 0;
    let timer = 0;
    const tick = () => {
      if (line >= lines.length) {
        timer = window.setTimeout(() => {
          line = 0;
          ch = 0;
          setDone([]);
          setCurrent("");
          tick();
        }, loopPause);
        return;
      }
      const text = lines[line];
      ch += 1;
      setCurrent(text.slice(0, ch));
      if (ch >= text.length) {
        timer = window.setTimeout(() => {
          setDone((d) => [...d, text]);
          setCurrent("");
          line += 1;
          ch = 0;
          tick();
        }, linePause);
      } else {
        timer = window.setTimeout(tick, speed + Math.random() * 30);
      }
    };
    timer = window.setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [lines, speed, linePause, loopPause, reduced]);

  return (
    <pre className="type" aria-live="off">
      {done.map((l, i) => (
        <span key={i} className="type-line">
          {l}
        </span>
      ))}
      {!reduced && (
        <span className="type-line">
          {current}
          <span className="caret" aria-hidden="true" />
        </span>
      )}
    </pre>
  );
}

/** endless scrolling band; pauses on hover */
export function Marquee({ children, reverse = false, duration = 40 }: { children: ReactNode; reverse?: boolean; duration?: number }) {
  return (
    <div className="marquee" style={{ ["--dur" as string]: `${duration}s` }}>
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/** ping radar. rings are latency on a sqrt scale, a sweep runs round every 5s and each blip flashes
 *  exactly when the beam crosses it (css delay = angle / 360 * period), readings tick like live pings,
 *  and clicking a blip blocks that server so the "best" readout moves, same as the app */
const RADAR_MAX = 160;
const RADAR_PERIOD = 5000;
const RADAR_ANGLES = [318, 38, 198, 98, 142, 264, 4, 70, 178, 236, 292];

export type RadarLabels = { you: string; scanning: string; best: string; servers: string; blocked: string; hint: string };

export function Radar({
  blips,
  labels,
  blocked: controlled,
  onToggle,
  compact = false,
  size = 360,
}: {
  blips: { label: string; ms: number; code?: string }[];
  labels: RadarLabels;
  /** pass these to drive the radar from outside (the hud concept shares state with its list) */
  blocked?: Set<string>;
  onToggle?: (label: string) => void;
  /** short code labels and no readout */
  compact?: boolean;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [own, setOwn] = useState<Set<string>>(() => new Set());
  const blocked = controlled ?? own;
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((n) => n + 1), 1800);
    return () => clearInterval(id);
  }, [reduced]);

  const RADAR_SIZE = size;
  const RADAR_R = (size * 132) / 360;
  const c = RADAR_SIZE / 2;
  const rOf = (ms: number) => RADAR_R * Math.sqrt(Math.min(ms, RADAR_MAX) / RADAR_MAX);
  const toggle = (label: string) => {
    if (onToggle) return onToggle(label);
    setOwn((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };
  const best = blips.filter((b) => !blocked.has(b.label)).sort((a, b) => a.ms - b.ms)[0];
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <div className={`radar ${compact ? "compact" : ""}`} style={{ width: RADAR_SIZE, height: RADAR_SIZE, ["--period" as string]: `${RADAR_PERIOD}ms` }} role="group" aria-label={labels.hint}>
      <div className="radar-disc" aria-hidden="true">
        <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}>
          <defs>
            <radialGradient id="radar-fill">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="0.6" stopColor="var(--accent)" stopOpacity="0.06" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0.14" />
            </radialGradient>
          </defs>
          <circle cx={c} cy={c} r={RADAR_R} fill="url(#radar-fill)" stroke="none" />
          {[40, 80, 120, 160].map((ms) => (
            <circle key={ms} cx={c} cy={c} r={rOf(ms)} className="radar-ring-line" />
          ))}
          {[0, 30, 60, 90, 120, 150].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return <line key={deg} x1={c - Math.cos(a) * RADAR_R} y1={c - Math.sin(a) * RADAR_R} x2={c + Math.cos(a) * RADAR_R} y2={c + Math.sin(a) * RADAR_R} className="radar-spoke" />;
          })}
          {ticks.map((deg) => {
            const a = ((deg - 90) * Math.PI) / 180;
            const len = deg % 30 === 0 ? 9 : 4;
            return <line key={deg} x1={c + Math.cos(a) * (RADAR_R - len)} y1={c + Math.sin(a) * (RADAR_R - len)} x2={c + Math.cos(a) * RADAR_R} y2={c + Math.sin(a) * RADAR_R} className="radar-tick" />;
          })}
          {[40, 160].map((ms) => (
            <text key={ms} x={c + 5} y={c + rOf(ms) - 5} className="radar-ring-label">
              {ms} ms
            </text>
          ))}
        </svg>
        <div className="radar-sweep" />
        <div className="radar-scan" />
      </div>
      <svg className="radar-rim" viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} aria-hidden="true">
        <circle cx={c} cy={c} r={RADAR_R + 8} />
      </svg>

      <div className="radar-you" aria-hidden="true">
        <i />
        <span>{labels.you}</span>
      </div>

      {blips.map((b, i) => {
        const deg = RADAR_ANGLES[i % RADAR_ANGLES.length];
        const a = ((deg - 90) * Math.PI) / 180;
        const r = rOf(b.ms);
        const x = c + Math.cos(a) * r;
        const y = c + Math.sin(a) * r;
        const right = Math.cos(a) >= 0;
        const jitter = reduced ? 0 : ((tick * 7 + i * 13) % 7) - 3;
        const off = blocked.has(b.label);
        return (
          <button
            key={b.label}
            className={`radar-blip ${right ? "r" : "l"} ${off ? "off" : ""}`}
            style={{ left: x, top: y, ["--hit" as string]: `${(deg / 360) * RADAR_PERIOD}ms` }}
            onClick={() => toggle(b.label)}
            aria-pressed={off}
            aria-label={`${b.label}, ${b.ms} ms`}
          >
            <i className="radar-dot" />
            <i className="radar-pulse" />
            <span className="radar-label" dir="ltr">
              {compact ? (
                <b className="tabular">{(b.code ?? b.label).toUpperCase()}</b>
              ) : (
                <>
                  {b.label} <b className="tabular">{off ? labels.blocked : Math.max(1, b.ms + jitter)}</b>
                </>
              )}
            </span>
          </button>
        );
      })}

      {!compact && (
      <div className="radar-readout" aria-live="polite">
        <span className="radar-status">
          <i />
          {labels.scanning}
        </span>
        <span>
          {labels.servers} <b className="tabular">{blips.length - blocked.size}/{blips.length}</b>
        </span>
        <span>
          {labels.best} <b dir="ltr">{best ? `${best.label} · ${best.ms} ms` : "—"}</b>
        </span>
      </div>
      )}
    </div>
  );
}

/** giant footer wordmark: each letter waves while it is on screen (transforms only, nothing repaints) */
export function Wordmark({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="wordmark" aria-hidden="true">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="wordmark-ch"
          style={{ ["--i" as string]: i }}
          initial={false}
          whileInView={reduced ? undefined : { y: [0, -18, 0], rotate: [0, -2, 0] }}
          viewport={{ amount: 0.4 }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.14 }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );
}

/** soft accent glow that follows the pointer */
export function CursorGlow() {
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 90, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 90, damping: 22, mass: 0.6 });
  useEffect(() => {
    if (matchMedia("(hover: none)").matches) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    addEventListener("mousemove", move, { passive: true });
    return () => removeEventListener("mousemove", move);
  }, [x, y]);
  return <motion.div className="cursor-glow" style={{ x: sx, y: sy }} aria-hidden="true" />;
}

/** single-series bars, baseline anchored, grow in on view */
export function Bars({ data, label }: { data: { v: string; n: number }[]; label: string }) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <div className="bars" role="img" aria-label={label}>
      {data.map((d, i) => (
        <div key={d.v} className="bar-slot" title={`${d.v}: ${num(d.n)}`}>
          <motion.div
            className="bar"
            style={{ height: `${Math.max(3, (d.n / max) * 100)}%` }}
            initial={reduced ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: i * 0.03, ease: EASE }}
          />
        </div>
      ))}
    </div>
  );
}
