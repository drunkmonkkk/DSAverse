import type { Progress, Activity, Status, Topic } from "./types";
export const STORAGE_KEY = "dsaverse-progress-v1";
export function emptyProgress(): Progress {
  return {
    version: 1,
    topics: {},
    problems: {},
    notes: {},
    bookmarks: [],
    revisions: {},
    events: [],
    preferences: {
      name: "Explorer",
      language: "Python",
      timezone: "UTC",
      theme: "dark",
      dailyMinutes: 30,
      experience: "Beginner",
      goal: "Interview preparation",
      interests: [],
    },
  };
}
export function isProgress(value: unknown): value is Progress {
  if (!value || typeof value !== "object") return false;
  const p = value as Progress;
  const record = (x: unknown) =>
    x && typeof x === "object" && !Array.isArray(x);
  if (
    p.version !== 1 ||
    !record(p.preferences) ||
    ![p.topics, p.problems, p.notes, p.revisions].every(record)
  )
    return false;
  try {
    new Intl.DateTimeFormat("en", {
      timeZone: p.preferences.timezone,
    }).format();
  } catch {
    return false;
  }
  return (
    ["Python", "JavaScript", "TypeScript", "Java", "C++", "C"].includes(
      p.preferences.language,
    ) &&
    ["light", "dark"].includes(p.preferences.theme) &&
    typeof p.preferences.name === "string" &&
    typeof p.preferences.timezone === "string" &&
    Number.isInteger(p.preferences.dailyMinutes) &&
    p.preferences.dailyMinutes >= 5 &&
    p.preferences.dailyMinutes <= 240 &&
    ["Beginner", "Intermediate", "Advanced"].includes(
      p.preferences.experience,
    ) &&
    typeof p.preferences.goal === "string" &&
    Array.isArray(p.preferences.interests) &&
    p.preferences.interests.every((x) => typeof x === "string") &&
    Object.values(p.topics).every((x) =>
      ["IN_PROGRESS", "COMPLETED"].includes(x),
    ) &&
    Object.values(p.problems).every((x) =>
      ["NOT_STARTED", "ATTEMPTED", "SOLVED", "REVISIT"].includes(x),
    ) &&
    Object.values(p.notes).every((x) => typeof x === "string") &&
    Object.values(p.revisions).every(
      (x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x),
    ) &&
    Array.isArray(p.bookmarks) &&
    p.bookmarks.every((x) => typeof x === "string") &&
    Array.isArray(p.events) &&
    new Set(p.events.map((e) => e?.id)).size === p.events.length &&
    p.events.every(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.target === "string" &&
        ["topic", "problem", "session", "revision"].includes(e.kind) &&
        Number.isFinite(Date.parse(e.at)) &&
        Number.isInteger(e.minutes) &&
        e.minutes >= 0 &&
        Number.isInteger(e.xp) &&
        e.xp >= 0 &&
        e.xp <= 100,
    )
  );
}
export function parseProgress(raw: string | null) {
  if (!raw) return emptyProgress();
  const p: unknown = JSON.parse(raw);
  if (!isProgress(p))
    throw new Error(
      "Saved data cannot be loaded. It has been preserved. Export it from Profile for recovery.",
    );
  return p;
}
export function dayKey(date: Date | string, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
}
export function shiftDay(day: string, delta: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
export function aggregateDays(events: Activity[], timezone: string) {
  const days: Record<
      string,
      {
        count: number;
        minutes: number;
        xp: number;
        problems: number;
        topics: number;
      }
    > = {},
    seen = new Set<string>();
  for (const e of events) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    const day = dayKey(e.at, timezone),
      d = (days[day] ??= {
        count: 0,
        minutes: 0,
        xp: 0,
        problems: 0,
        topics: 0,
      });
    d.count++;
    d.minutes += e.minutes;
    d.xp += e.xp;
    if (e.kind === "problem") d.problems++;
    if (e.kind === "topic") d.topics++;
  }
  return days;
}
export function streaks(
  events: Activity[],
  timezone: string,
  now = new Date(),
) {
  const today = dayKey(now, timezone),
    days = Object.keys(aggregateDays(events, timezone))
      .filter((d) => d <= today)
      .sort();
  let run = 0,
    longest = 0,
    previous = "";
  for (const d of days) {
    run = previous && shiftDay(previous, 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = d;
  }
  let cursor = days.includes(today) ? today : shiftDay(today, -1),
    current = 0;
  const set = new Set(days);
  while (set.has(cursor)) {
    current++;
    cursor = shiftDay(cursor, -1);
  }
  return {
    current,
    longest,
    totalDays: days.length,
    lastActive: days.at(-1) ?? null,
  };
}
export function reward(p: Progress, e: Activity) {
  return p.events.some((x) => x.id === e.id)
    ? p
    : { ...p, events: [...p.events, e] };
}
export function completeTopic(
  p: Progress,
  t: Topic,
  at = new Date().toISOString(),
) {
  if (!t.prerequisites.every((id) => p.topics[id] === "COMPLETED")) return p;
  return reward(
    { ...p, topics: { ...p.topics, [t.id]: "COMPLETED" } },
    {
      id: `topic:${t.id}`,
      kind: "topic",
      target: t.id,
      at,
      minutes: 0,
      xp: 50,
    },
  );
}
export function setProblemStatus(
  p: Progress,
  id: string,
  status: Status,
  at = new Date().toISOString(),
) {
  const next = { ...p, problems: { ...p.problems, [id]: status } };
  return status === "SOLVED"
    ? reward(next, {
        id: `problem:${id}`,
        kind: "problem",
        target: id,
        at,
        minutes: 0,
        xp: 30,
      })
    : next;
}
export function makePlan(topics: Topic[], p: Progress) {
  const ready = topics.filter(
    (t) =>
      p.topics[t.id] !== "COMPLETED" &&
      t.prerequisites.every((id) => p.topics[id] === "COMPLETED"),
  );
  const score = (t: Topic) =>
    (p.preferences.interests.includes(t.category) ? 20 : 0) +
    (p.preferences.goal === "Competitive programming" && t.level >= 7 ? 6 : 0) +
    (p.preferences.goal === "Interview preparation" &&
    [1, 2, 3, 6].includes(t.level)
      ? 6
      : 0) +
    (p.preferences.goal === "Revision" && p.topics[t.id] === "IN_PROGRESS"
      ? 10
      : 0) +
    (t.difficulty ===
    (p.preferences.experience === "Beginner"
      ? "Easy"
      : p.preferences.experience === "Intermediate"
        ? "Medium"
        : "Hard")
      ? 3
      : 0);
  ready.sort((a, b) => score(b) - score(a) || a.level - b.level);
  let minutes = p.preferences.dailyMinutes;
  return ready.filter((t, i) => {
    if (t.estimated_minutes <= minutes || i === 0) {
      minutes -= t.estimated_minutes;
      return true;
    }
    return false;
  });
}
export function achievements(p: Progress) {
  const solves = new Set(
      p.events.filter((e) => e.kind === "problem").map((e) => e.target),
    ).size,
    completed = Object.values(p.topics).filter((x) => x === "COMPLETED").length,
    s = streaks(p.events, p.preferences.timezone);
  return [
    {
      title: "First solve",
      description: "Solve your first problem.",
      earned: solves > 0,
    },
    {
      title: "Finding your rhythm",
      description: "Reach a 7-day streak.",
      earned: s.longest >= 7,
    },
    {
      title: "Unstoppable",
      description: "Reach a 30-day streak.",
      earned: s.longest >= 30,
    },
    {
      title: "Century club",
      description: "Solve 100 problems.",
      earned: solves >= 100,
    },
    {
      title: "Roadmap explorer",
      description: "Complete 10 topics.",
      earned: completed >= 10,
    },
    {
      title: "Array master",
      description: "Complete array foundations.",
      earned: [
        "arrays",
        "array-traversal",
        "array-reversal",
        "array-rotation",
        "prefix-sums",
        "difference-arrays",
      ].every((id) => p.topics[id] === "COMPLETED"),
    },
    {
      title: "Hashing master",
      description: "Complete the hashing chapter.",
      earned: [
        "hash-functions",
        "hashmap",
        "hashset",
        "frequency-maps",
        "collision-handling",
        "hash-table-operations",
        "common-hashing-patterns",
      ].every((id) => p.topics[id] === "COMPLETED"),
    },
  ];
}
