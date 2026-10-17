"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Square, Timer, ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";
import { useProgress } from "./progress-provider";
import { aggregateDays, dayKey, shiftDay, reward } from "@/lib/progress";
export function Heading({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="between page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="row wrap">{children}</div>}
    </div>
  );
}
export function Empty({
  title,
  description,
  href,
  label = "Explore",
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Button asChild variant="outline">
          <Link href={href}>
            {label}
            <ArrowUpRight size={14} />
          </Link>
        </Button>
      )}
    </div>
  );
}
export function Loading() {
  return (
    <div
      className="stack"
      role="status"
      aria-label="Loading your learning space"
    >
      <div className="skeleton" />
      <div className="skeleton tall" />
    </div>
  );
}
export function Heatmap() {
  const { state } = useProgress(),
    days = aggregateDays(state.events, state.preferences.timezone),
    today = dayKey(new Date(), state.preferences.timezone),
    start = shiftDay(today, -181);
  return (
    <div>
      <div className="between" style={{ marginBottom: 10 }}>
        <small>{start}</small>
        <small>Today</small>
      </div>
      <div
        className="heatmap"
        role="img"
        aria-label={`Daily activity over 26 weeks. ${Object.keys(days).length} active days recorded.`}
      >
        {Array.from({ length: 182 }, (_, i) => {
          const date = shiftDay(start, i),
            count = days[date]?.count ?? 0;
          return (
            <span
              key={date}
              className={`heat-cell l${Math.min(4, count)}`}
              title={`${date}: ${count} activities`}
            />
          );
        })}
      </div>
      <small style={{ display: "block", textAlign: "right", marginTop: 10 }}>
        Darker → lighter: less → more activity
      </small>
    </div>
  );
}
export function SessionTimer() {
  const { update, notify } = useProgress(),
    [start, setStart] = useState<number | null>(null),
    [seconds, setSeconds] = useState(0),
    id = useRef("");
  useEffect(() => {
    if (start === null) return;
    const timer = setInterval(
      () => setSeconds(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [start]);
  function toggle() {
    if (start === null) {
      id.current = `session:${crypto.randomUUID()}`;
      setStart(Date.now());
      return;
    }
    const minutes = Math.floor((Date.now() - start) / 60000);
    if (minutes < 1) {
      notify("Study for at least one minute before saving.");
      return;
    }
    update(
      (s) =>
        reward(s, {
          id: id.current,
          kind: "session",
          target: "focus",
          at: new Date().toISOString(),
          minutes,
          xp: Math.min(60, minutes * 2),
        }),
      "Study session saved. Nice work!",
    );
    setStart(null);
    setSeconds(0);
  }
  return (
    <section className="card pad">
      <div className="between">
        <h2>Make time for focus</h2>
        <Timer size={17} className="purple" />
      </div>
      <p className="subtitle">
        A little uninterrupted practice goes a long way.
      </p>
      <div className="clock">
        {String(Math.floor(seconds / 60)).padStart(2, "0")}
        <span className="muted">:</span>
        {String(seconds % 60).padStart(2, "0")}
      </div>
      <Button
        onClick={toggle}
        className="full"
        variant={start ? "outline" : "default"}
      >
        {start ? (
          <>
            <Square size={13} /> Finish & save session
          </>
        ) : (
          <>
            <Play size={14} /> Start a focus session
          </>
        )}
      </Button>
      <small style={{ display: "block", marginTop: 10 }}>
        Keep this page open. Only finished sessions count.
      </small>
    </section>
  );
}
