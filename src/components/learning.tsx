"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const RoadmapGraph = dynamic(() => import("./roadmap-graph"), { ssr: false });
import Link from "next/link";
import { topics, categories, topicState } from "@/data/curriculum";
import { problems } from "@/data/problems";
import { languages, type Status } from "@/lib/types";
import { completeTopic, setProblemStatus } from "@/lib/progress";
import { useProgress } from "./progress-provider";
import { Heading, Loading, Empty } from "./widgets";
export function Roadmap() {
  const { state, ready } = useProgress(),
    [query, setQuery] = useState(""),
    [graph, setGraph] = useState(false);
  if (!ready) return <Loading />;
  return (
    <>
      <Heading
        title="Your learning roadmap"
        description="Build a strong foundation, one connected concept at a time. 102 concise lessons across nine chapters."
      />
      <div className="row section" style={{ marginBottom: 20 }}>
        <button className="button outline" onClick={() => setGraph(!graph)}>
          {graph ? "Show chapter list" : "Show prerequisite graph"}
        </button>
      </div>
      {graph && <RoadmapGraph />}
      <label className="field">
        Search topics
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try binary search…"
        />
      </label>
      {categories.map((c, i) => (
        <section className="card pad section" key={c}>
          <span className="eyebrow">
            CHAPTER {String(i + 1).padStart(2, "0")}
          </span>
          <h2>{c}</h2>
          {topics
            .filter(
              (t) =>
                t.category === c &&
                t.title.toLowerCase().includes(query.toLowerCase()),
            )
            .map((t) => (
              <Link
                href={`/learn/${t.slug}`}
                className="lesson-row between"
                key={t.id}
              >
                <div>
                  <strong>{t.title}</strong>
                  <p className="subtitle">
                    {t.estimated_minutes} min · {t.difficulty}
                  </p>
                </div>
                <span
                  className={`pill ${state.topics[t.id] === "COMPLETED" ? "success" : ""}`}
                >
                  {topicState(t, state.topics).replaceAll("_", " ")}
                </span>
              </Link>
            ))}
        </section>
      ))}
    </>
  );
}
export function BookmarkButton({ id }: { id: string }) {
  const { state, update } = useProgress();
  return (
    <button
      className="button outline"
      onClick={() =>
        update((s) => ({
          ...s,
          bookmarks: s.bookmarks.includes(id)
            ? s.bookmarks.filter((x) => x !== id)
            : [...s.bookmarks, id],
        }))
      }
    >
      {state.bookmarks.includes(id) ? "Remove bookmark" : "Bookmark"}
    </button>
  );
}
export function Notes({ id }: { id: string }) {
  const { state, update } = useProgress();
  return (
    <label className="field section">
      Your notes
      <textarea
        rows={5}
        placeholder="Explain the key idea in your own words…"
        value={state.notes[id] ?? ""}
        onChange={(e) =>
          update((s) => ({ ...s, notes: { ...s.notes, [id]: e.target.value } }))
        }
      />
      <small>Saved as you type.</small>
    </label>
  );
}
export function Lesson({ slug }: { slug: string }) {
  const { state, ready, update } = useProgress();
  const t = topics.find((t) => t.slug === slug)!;
  if (!ready) return <Loading />;
  const locked = topicState(t, state.topics) === "LOCKED";
  return (
    <>
      <Heading
        title={t.title}
        description={t.category}
        eyebrow={`${t.difficulty} · ${t.estimated_minutes} MIN`}
      >
        <BookmarkButton id={t.id} />
      </Heading>
      <div className="two-col lesson-layout">
        <article className="card pad lesson">
          <h2>The idea</h2>
          <p>{t.explanation}</p>
          <h2>Learning goals</h2>
          <ul>
            {t.learning_objectives.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <h2>Work through an example</h2>
          {t.examples.map((x) => (
            <p className="callout" key={x}>
              {x}
            </p>
          ))}
          <h2>Try it yourself</h2>
          <p>
            Change one value in the example. Predict the result before tracing
            the operations. What happens with an empty input or a single item?
          </p>
          {t.visualizer_type && (
            <Link
              className="button primary"
              href={`/visualizer/${t.visualizer_type}`}
            >
              Explore in the visualizer →
            </Link>
          )}
          <h2>Complexity</h2>
          <p>Time: {t.time_complexity}</p>
          <p>Space: {t.space_complexity}</p>
          <h2>Common mistakes</h2>
          <ul>
            {t.common_mistakes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <h2>Code reference</h2>
          <p className="subtitle">
            {t.slug.includes("binary-search")
              ? "Runnable binary search example."
              : "Shared array traversal reference. Topic-specific implementations are still being expanded."}
          </p>
          <label className="field">
            Language
            <select
              value={state.preferences.language}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  preferences: {
                    ...s.preferences,
                    language: e.target.value as (typeof languages)[number],
                  },
                }))
              }
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <pre className="code-content">
            {t.code_examples[state.preferences.language]}
          </pre>
          <Notes id={t.id} />
          <button
            className="button primary"
            disabled={locked || state.topics[t.id] === "COMPLETED"}
            onClick={() =>
              update((s) => completeTopic(s, t), "Lesson completed!")
            }
          >
            {state.topics[t.id] === "COMPLETED"
              ? "Completed ✓"
              : locked
                ? "Complete prerequisites first"
                : "Mark complete"}
          </button>
        </article>
        <aside className="stack">
          <section className="card pad">
            <h2>Before this lesson</h2>
            {t.prerequisites.length ? (
              t.prerequisites.map((id) => (
                <Link className="lesson-row" key={id} href={`/learn/${id}`}>
                  {state.topics[id] === "COMPLETED" ? "✓" : "○"}{" "}
                  {topics.find((t) => t.id === id)?.title}
                </Link>
              ))
            ) : (
              <p>No prerequisites. Start here.</p>
            )}
          </section>
          <section className="card pad">
            <h2>Practice next</h2>
            {problems
              .filter((p) => p.prerequisites.includes(t.id))
              .slice(0, 4)
              .map((p) => (
                <Link
                  className="lesson-row"
                  key={p.id}
                  href={`/practice/${p.slug}`}
                >
                  {p.title}
                </Link>
              ))}
            <Link href="/practice">Browse all problems →</Link>
          </section>
        </aside>
      </div>
    </>
  );
}
const statuses: Status[] = ["NOT_STARTED", "ATTEMPTED", "SOLVED", "REVISIT"];
export function Practice() {
  const { state, ready } = useProgress(),
    [query, setQuery] = useState(""),
    [difficulty, setDifficulty] = useState("All"),
    [status, setStatus] = useState("All");
  if (!ready) return <Loading />;
  const filtered = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) &&
      (difficulty === "All" || p.difficulty === difficulty) &&
      (status === "All" || (state.problems[p.id] ?? "NOT_STARTED") === status),
  );
  return (
    <>
      <Heading
        title="Practice with purpose"
        description="172 curated problems. Track your own attempts and build confidence through repetition."
      />
      <div className="filters row wrap">
        <label className="field">
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="field">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {["All", "Easy", "Medium", "Hard"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {["All", ...statuses].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <p>{filtered.length} problems</p>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Problem</th>
              <th>Difficulty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/practice/${p.slug}`}>{p.title}</Link>
                  <small style={{ display: "block" }}>{p.topic}</small>
                </td>
                <td>
                  <span className={`pill ${p.difficulty}`}>{p.difficulty}</span>
                </td>
                <td>
                  {(state.problems[p.id] ?? "NOT_STARTED").replaceAll("_", " ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && (
        <Empty
          title="No matching problems"
          description="Try another search or filter."
        />
      )}
    </>
  );
}
export function ProblemDetail({ slug }: { slug: string }) {
  const { state, ready, update } = useProgress();
  const p = problems.find((p) => p.slug === slug)!;
  if (!ready) return <Loading />;
  return (
    <>
      <Heading
        title={p.title}
        description={`${p.topic} · ${p.difficulty} · approximately ${p.estimated_minutes} minutes`}
      >
        <BookmarkButton id={p.id} />
      </Heading>
      <section className="card pad">
        <h2>Your next challenge</h2>
        <p>
          Read the original problem, identify an invariant, and test the
          boundaries before coding. Statuses are self-reported; DSAverse does
          not execute or grade submissions.
        </p>
        <a
          className="button primary"
          href={p.problem_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open problem on LeetCode ↗
        </a>
        <div className="form-grid section">
          <label className="field">
            Practice status
            <select
              value={state.problems[p.id] ?? "NOT_STARTED"}
              onChange={(e) =>
                update(
                  (s) => setProblemStatus(s, p.id, e.target.value as Status),
                  "Practice status saved.",
                )
              }
            >
              {statuses.map((x) => (
                <option key={x} value={x}>
                  {x.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Revisit date
            <input
              type="date"
              value={state.revisions[p.id] ?? ""}
              onChange={(e) =>
                update((s) => {
                  const revisions = { ...s.revisions };
                  if (e.target.value) revisions[p.id] = e.target.value;
                  else delete revisions[p.id];
                  return { ...s, revisions };
                })
              }
            />
          </label>
        </div>
        <Notes id={p.id} />
      </section>
    </>
  );
}
export function Bookmarks() {
  const { state, ready } = useProgress();
  if (!ready) return <Loading />;
  return (
    <>
      <Heading
        title="Your saved ideas"
        description="Lessons and challenges to come back to."
      />
      {!state.bookmarks.length ? (
        <Empty
          title="Keep something worth revisiting"
          description="Bookmark a lesson or practice problem to see it here."
          href="/roadmap"
        />
      ) : (
        <div className="tiles">
          {state.bookmarks.map((id) => {
            const t = topics.find((t) => t.id === id),
              p = problems.find((p) => p.id === id);
            return t || p ? (
              <Link
                className="card pad"
                key={id}
                href={t ? `/learn/${t.slug}` : `/practice/${p!.slug}`}
              >
                <h2>{t?.title ?? p?.title}</h2>
                <p>{t ? "Lesson" : "Practice problem"} →</p>
              </Link>
            ) : null;
          })}
        </div>
      )}
    </>
  );
}
