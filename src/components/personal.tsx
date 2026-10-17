"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useProgress } from "./progress-provider";
import { Heading, Heatmap, Loading, Empty } from "./widgets";
import { topics, categories } from "@/data/curriculum";
import { problems } from "@/data/problems";
import {
  achievements,
  aggregateDays,
  dayKey,
  makePlan,
  reward,
  STORAGE_KEY,
} from "@/lib/progress";
import { browserSupabase, cloudConfigured } from "@/lib/supabase";
export function Analytics() {
  const { state, ready } = useProgress();
  if (!ready) return <Loading />;
  const days = Object.entries(
    aggregateDays(state.events, state.preferences.timezone),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, v]) => ({ date, ...v }));
  return (
    <>
      <Heading
        title="Your effort, made visible"
        description="Activity, milestones, and time recorded from your own learning."
      />
      <div className="card pad">
        <h2>Consistency over intensity</h2>
        <Heatmap />
      </div>
      <section className="card pad section">
        <h2>Study minutes · last 14 active days</h2>
        {days.length ? (
          <>
            <div style={{ height: 260, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={days}>
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#a78bfa" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p>
              {days.reduce((n, d) => n + d.minutes, 0)} minutes across the
              displayed days.
            </p>
          </>
        ) : (
          <Empty
            title="Your story starts with one session"
            description="Finish a focus session on the dashboard to record study time."
            href="/dashboard"
          />
        )}
      </section>
      <div className="tiles">
        {achievements(state).map((a) => (
          <div
            key={a.title}
            className={`card pad achievement ${a.earned ? "" : "locked"}`}
          >
            <span className="pill">
              {a.earned ? "Earned ✓" : "In progress"}
            </span>
            <h2>{a.title}</h2>
            <p>{a.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
export function Planner() {
  const { state, ready, update } = useProgress();
  if (!ready) return <Loading />;
  const today = dayKey(new Date(), state.preferences.timezone),
    due = Object.entries(state.revisions).filter(([, d]) => d <= today);
  return (
    <>
      <Heading
        title="Make room for progress"
        description="A prerequisite-aware plan based on your time, interests, and goals."
      />
      <div className="card pad">
        <div className="form-grid">
          <label className="field">
            Daily minutes
            <input
              type="number"
              min="5"
              max="240"
              value={state.preferences.dailyMinutes}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n >= 5 && n <= 240)
                  update((s) => ({
                    ...s,
                    preferences: { ...s.preferences, dailyMinutes: n },
                  }));
              }}
            />
          </label>
          <label className="field">
            Goal
            <select
              value={state.preferences.goal}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  preferences: { ...s.preferences, goal: e.target.value },
                }))
              }
            >
              {[
                "Interview preparation",
                "Competitive programming",
                "Revision",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Experience
            <select
              value={state.preferences.experience}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  preferences: {
                    ...s.preferences,
                    experience: e.target.value as
                      "Beginner" | "Intermediate" | "Advanced",
                  },
                }))
              }
            >
              {["Beginner", "Intermediate", "Advanced"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <h3>Interests</h3>
        <div className="row wrap">
          {categories.map((c) => (
            <label key={c} className="pill">
              <input
                type="checkbox"
                checked={state.preferences.interests.includes(c)}
                onChange={() =>
                  update((s) => ({
                    ...s,
                    preferences: {
                      ...s.preferences,
                      interests: s.preferences.interests.includes(c)
                        ? s.preferences.interests.filter((x) => x !== c)
                        : [...s.preferences.interests, c],
                    },
                  }))
                }
              />
              {c}
            </label>
          ))}
        </div>
      </div>
      <section className="card pad section">
        <h2>Today’s learning path</h2>
        {makePlan(topics, state).map((t) => (
          <Link
            key={t.id}
            className="lesson-row between"
            href={`/learn/${t.slug}`}
          >
            <strong>{t.title}</strong>
            <span>{t.estimated_minutes} min →</span>
          </Link>
        ))}
        <p className="subtitle">
          The first lesson may exceed a short daily budget; split it across
          sessions.
        </p>
      </section>
      <section className="card pad">
        <h2>Due for revision</h2>
        {due.length ? (
          due.map(([id, date]) => (
            <div className="lesson-row between" key={id}>
              <Link
                href={`/practice/${problems.find((p) => p.id === id)?.slug ?? id}`}
              >
                {problems.find((p) => p.id === id)?.title ?? id}
                <small> · {date}</small>
              </Link>
              <button
                className="button outline"
                onClick={() =>
                  update((s) => {
                    const revisions = { ...s.revisions };
                    delete revisions[id];
                    return reward(
                      { ...s, revisions },
                      {
                        id: `revision:${id}:${date}`,
                        kind: "revision",
                        target: id,
                        at: new Date().toISOString(),
                        minutes: 0,
                        xp: 10,
                      },
                    );
                  }, "Revision complete.")
                }
              >
                Reviewed
              </button>
            </div>
          ))
        ) : (
          <p>No revisions due. Schedule them from a practice problem.</p>
        )}
      </section>
    </>
  );
}
function download(data: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([data], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Profile() {
  const { state, ready, user, update, logout, sync, notify } = useProgress();
  if (!ready) return <Loading />;
  return (
    <>
      <Heading
        title="Make this space yours"
        description="Your preferences and learning data, under your control."
      />
      <div className="card pad">
        <label className="field">
          Display name
          <input
            maxLength={80}
            value={state.preferences.name}
            onChange={(e) =>
              update((s) => ({
                ...s,
                preferences: { ...s.preferences, name: e.target.value },
              }))
            }
          />
        </label>
        <label className="field section">
          Timezone
          <select
            value={state.preferences.timezone}
            onChange={(e) =>
              update((s) => ({
                ...s,
                preferences: { ...s.preferences, timezone: e.target.value },
              }))
            }
          >
            {Array.from(
              new Set([
                state.preferences.timezone,
                "UTC",
                ...Intl.supportedValuesOf("timeZone"),
              ]),
            ).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <p>
          {sync}. Guest data stays in this browser; export before clearing
          browser storage.
        </p>
        <div className="row wrap">
          <button
            className="button primary"
            onClick={() =>
              download(JSON.stringify(state, null, 2), "dsaverse-progress.json")
            }
          >
            Export progress
          </button>
          <button
            className="button outline"
            onClick={() => {
              try {
                download(
                  localStorage.getItem(STORAGE_KEY) ?? "{}",
                  "dsaverse-raw-local.json",
                );
              } catch {
                notify("Browser storage is unavailable.");
              }
            }}
          >
            Export raw local backup
          </button>
          {user ? (
            <button className="button outline" onClick={() => void logout()}>
              Sign out
            </button>
          ) : (
            <Link className="button outline" href="/auth">
              Cloud sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
export function Auth() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(signup: boolean) {
    setBusy(true);
    try {
      const client = browserSupabase();
      if (!client) throw Error("Cloud authentication is not configured.");
      const { error } = signup
        ? await client.auth.signUp({ email, password })
        : await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage(
        signup
          ? "Check your email to confirm your account."
          : "Signed in. Open your dashboard.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth card pad">
      <Heading
        title="Welcome to DSAverse"
        description="Learn locally, or sign in to a configured Supabase project."
      />
      {!cloudConfigured && (
        <p className="callout">
          Cloud authentication is not configured in this environment. Local
          learning is available without an account.
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(false);
        }}
      >
        <label className="field">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          Password
          <input
            required
            minLength={8}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="row wrap section">
          <button
            className="button primary"
            disabled={!cloudConfigured || busy}
          >
            Sign in
          </button>
          <button
            type="button"
            className="button outline"
            disabled={!cloudConfigured || busy || !email || password.length < 8}
            onClick={() => void submit(true)}
          >
            Create account
          </button>
        </div>
      </form>
      <p role="status">{message}</p>
      <Link href="/dashboard" className="text-link">
        Continue to dashboard →
      </Link>
    </div>
  );
}
