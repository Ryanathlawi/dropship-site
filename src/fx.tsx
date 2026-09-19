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

/** ping radar: rings are latency (sqrt scale so the near servers don't pile up in the middle),
 *  a sweep runs round, blips pulse, and the numbers tick like a live reading */
const RADAR_W = 300;
const RADAR_H = 264;
const RADAR_R = 88;
const RADAR_MAX = 160;
const RADAR_ANGLES = [318, 38, 208, 98, 142, 243, 4];

export function Radar({ blips, you }: { blips: { label: string; ms: number }[]; you: string }) {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((n) => n + 1), 1800);
    return () => clearInterval(id);
  }, [reduced]);

  const cx = RADAR_W / 2;
  const cy = RADAR_H / 2;
  const rOf = (ms: number) => RADAR_R * Math.sqrt(Math.min(ms, RADAR_MAX) / RADAR_MAX);
  const rings = [40, 80, 120, 160];

  return (
    <div className="radar" role="img" aria-label={blips.map((b) => `${b.label} ${b.ms} ms`).join(", ")} style={{ width: RADAR_W, height: RADAR_H }}>
      <div className="radar-disc" style={{ left: cx - RADAR_R, top: cy - RADAR_R, width: RADAR_R * 2, height: RADAR_R * 2 }} aria-hidden="true">
        <div className="radar-sweep" />
      </div>
      <svg viewBox={`0 0 ${RADAR_W} ${RADAR_H}`} aria-hidden="true">
        {rings.map((ms) => (
          <circle key={ms} cx={cx} cy={cy} r={rOf(ms)} />
        ))}
        <line x1={cx - RADAR_R} y1={cy} x2={cx + RADAR_R} y2={cy} />
        <line x1={cx} y1={cy - RADAR_R} x2={cx} y2={cy + RADAR_R} />
        {[40, 160].map((ms) => (
          <text key={ms} x={cx + 4} y={cy + rOf(ms) - 4} className="radar-ring-label">
            {ms} ms
          </text>
        ))}
      </svg>
      <div className="radar-you" style={{ left: cx, top: cy }} aria-hidden="true">
        <i />
        <span>{you}</span>
      </div>
      {blips.map((b, i) => {
        const a = ((RADAR_ANGLES[i % RADAR_ANGLES.length] - 90) * Math.PI) / 180;
        const r = rOf(b.ms);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        const right = Math.cos(a) >= 0;
        const jitter = reduced ? 0 : ((tick * 7 + i * 13) % 7) - 3;
        return (
          <div key={b.label} className={`radar-blip ${right ? "r" : "l"}`} style={{ left: x, top: y, animationDelay: `${i * 0.35}s` }} aria-hidden="true">
            <i className="radar-dot" />
            <i className="radar-ring" />
            <span className="radar-label" dir="ltr">
              {b.label} <b className="tabular">{Math.max(1, b.ms + jitter)}</b>
            </span>
          </div>
        );
      })}
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
