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

/** radar sweep with labelled blips */
export function Radar({ blips }: { blips: { label: string; ms: number; angle: number; r: number }[] }) {
  const pt = (angle: number, r: number) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return { x: 100 + Math.cos(a) * r * 92, y: 100 + Math.sin(a) * r * 92 };
  };
  return (
    <div className="radar" role="img" aria-label={blips.map((b) => `${b.label} ${b.ms} ms`).join(", ")}>
      <div className="radar-sweep" aria-hidden="true" />
      <svg viewBox="0 0 200 200" aria-hidden="true">
        {[92, 69, 46, 23].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} />
        ))}
        <line x1="100" y1="8" x2="100" y2="192" />
        <line x1="8" y1="100" x2="192" y2="100" />
        {blips.map((b, i) => {
          const { x, y } = pt(b.angle, b.r);
          return (
            <g key={b.label} className="blip" style={{ animationDelay: `${i * 0.4}s` }}>
              <circle cx={x} cy={y} r="3.2" className="blip-dot" />
              <circle cx={x} cy={y} r="3.2" className="blip-ring" />
              <text x={x + 6} y={y - 5}>
                {b.label} · {b.ms}
              </text>
            </g>
          );
        })}
      </svg>
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
