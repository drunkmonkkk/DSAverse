"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Flame,
  Clock,
  GitBranch,
  Sparkles,
  Check,
  Lock,
  Target,
  Play,
  Zap,
} from "lucide-react";
import { useProgress } from "./progress-provider";
import { Heading, Heatmap, SessionTimer, Loading } from "./widgets";
import { Button } from "./ui/button";
import { topics, topicState, categories } from "@/data/curriculum";
import { problems } from "@/data/problems";
import { makePlan, aggregateDays, dayKey, streaks } from "@/lib/progress";
export default function Dashboard() {
  const { state, ready } = useProgress();
  if (!ready) return <Loading />;
  const completed = Object.values(state.topics).filter(
      (x) => x === "COMPLETED",
    ).length,
    solved = Object.values(state.problems).filter((x) => x === "SOLVED").length,
    s = streaks(state.events, state.preferences.timezone),
    minutes = state.events.reduce((n, e) => n + e.minutes, 0),
    plan = makePlan(topics, state),
    next = plan[0],
    today = aggregateDays(state.events, state.preferences.timezone)[
      dayKey(new Date(), state.preferences.timezone)
    ];
  return (
    <>
      <Heading
        title={`Welcome ${state.events.length ? "back" : "aboard"}, ${state.preferences.name.split(" ")[0]} 👋`}
        description="A little progress every day adds up to something extraordinary."
      >
        <Button asChild variant="outline">
          <Link href="/planner">
            <Target size={14} />
            My learning plan
          </Link>
        </Button>
      </Heading>
      <section className="hero">
        <div>
          <div className="eyebrow row">
            <Sparkles size={13} />
            YOUR NEXT BREAKTHROUGH STARTS HERE
          </div>
          <h2>
            {next
              ? `Let’s make ${next.title.toLowerCase()} click.`
              : "Look how far you’ve come."}
          </h2>
          <p>
            Build intuition, see the idea in action, and turn a tricky concept
            into something that makes sense.
          </p>
          <div className="row">
            <Button asChild>
              <Link href={next ? `/learn/${next.slug}` : "/practice"}>
                {completed ? "Continue learning" : "Begin your journey"}
                <ArrowRight size={15} />
              </Link>
            </Button>
            <small>
              {next
                ? `${next.estimated_minutes} min · ${next.difficulty}`
                : "Keep practicing"}
            </small>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="array-art">
            {[3, 8, 2, 5, 1].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <small>understand. visualize. remember.</small>
        </div>
      </section>
      <div className="stats">
        {[
          {
            label: "Problems solved",
            value: solved,
            unit: `/ ${problems.length}`,
            foot: "Explicitly self-reported progress",
            icon: Code2,
          },
          {
            label: "Topics completed",
            value: completed,
            unit: `/ ${topics.length}`,
            foot: `${Math.round((completed / topics.length) * 100)}% of your roadmap`,
            icon: BookOpen,
          },
          {
            label: "Current streak",
            value: s.current,
            unit: "days",
            foot: `Personal best: ${s.longest} days`,
            icon: Flame,
          },
          {
            label: "Time invested",
            value: minutes,
            unit: "min",
            foot: "From completed focus sessions",
            icon: Clock,
          },
        ].map((stat) => (
          <section className="card stat" key={stat.label}>
            <div className="between">
              <span className="stat-label">{stat.label}</span>
              <span className="icon-box">
                <stat.icon size={15} />
              </span>
            </div>
            <div className="stat-number">
              {stat.value}
              <small>{stat.unit}</small>
            </div>
            <small>{stat.foot}</small>
          </section>
        ))}
      </div>
      <div className="two-col">
        <div className="stack">
          <section className="card pad">
            <div className="card-header">
              <div>
                <h2>Your learning path</h2>
                <p className="subtitle">
                  A clear direction. One concept at a time.
                </p>
              </div>
              <Link href="/roadmap" className="text-link">
                View roadmap
                <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="between">
              <small className="row">
                <GitBranch size={14} />
                Overall progress
              </small>
              <small className="purple">
                {completed} of {topics.length} topics
              </small>
            </div>
            <div className="track" style={{ marginTop: 10 }}>
              <span
                style={{ width: `${(completed / topics.length) * 100}%` }}
              />
            </div>
            <div className="path">
              {categories.slice(0, 5).map((c, i) => {
                const ts = topics.filter((t) => t.level === i),
                  done = ts.every((t) => state.topics[t.id] === "COMPLETED"),
                  available = ts.some(
                    (t) => topicState(t, state.topics) === "AVAILABLE",
                  );
                return (
                  <Link key={c} href="/roadmap">
                    <span
                      className={
                        done ? "green" : available ? "purple" : "muted"
                      }
                    >
                      {done ? (
                        <Check size={14} />
                      ) : available ? (
                        <Play size={12} />
                      ) : (
                        <Lock size={12} />
                      )}
                    </span>
                    <small>
                      {
                        [
                          "Foundations",
                          "Arrays",
                          "Hashing",
                          "Patterns",
                          "Structures",
                        ][i]
                      }
                    </small>
                  </Link>
                );
              })}
            </div>
          </section>
          <section className="card pad">
            <div className="card-header">
              <div>
                <h2>Pick up a new idea</h2>
                <p className="subtitle">
                  Your next steps, in prerequisite order.
                </p>
              </div>
              <span className="pill accent">FOR YOU</span>
            </div>
            {plan.map((t) => (
              <Link href={`/learn/${t.slug}`} key={t.id} className="lesson-row">
                <span className="icon-box">
                  <BookOpen size={18} />
                </span>
                <div className="info">
                  <h3>{t.title}</h3>
                  <p>
                    {t.category} · {t.estimated_minutes} min
                  </p>
                </div>
                <span className={`pill ${t.difficulty}`}>{t.difficulty}</span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
            <Link href="/practice/two-sum" className="lesson-row">
              <span className="icon-box">
                <Code2 size={18} />
              </span>
              <div className="info">
                <h3>Two Sum</h3>
                <p>Practice suggestion · 20 min</p>
              </div>
              <span className="pill Easy">Easy</span>
              <ArrowUpRight size={16} />
            </Link>
          </section>
          <section className="card pad">
            <div className="card-header">
              <div>
                <h2>Consistency, visualized</h2>
                <p className="subtitle">
                  {s.totalDays} active days. Every square starts with a small
                  step.
                </p>
              </div>
              <Link href="/analytics" className="text-link">
                Analytics
                <ArrowUpRight size={13} />
              </Link>
            </div>
            <Heatmap />
          </section>
        </div>
        <aside className="stack">
          <section className="card pad">
            <div className="card-header">
              <h2>Today’s intention</h2>
              <Target size={17} className="purple" />
            </div>
            <h3>You’ve got this.</h3>
            <p className="subtitle">Settle in. Start small. Stay curious.</p>
            <div className="stat-number">
              {today?.minutes ?? 0}
              <small>/ {state.preferences.dailyMinutes} minutes</small>
            </div>
            <div className="track">
              <span
                style={{
                  width: `${Math.min(100, ((today?.minutes ?? 0) / state.preferences.dailyMinutes) * 100)}%`,
                }}
              />
            </div>
            <hr className="divider" />
            <div className="between">
              <small>
                {today?.problems ?? 0} solves · {today?.topics ?? 0} topics
              </small>
              <Link href="/planner" className="text-link">
                Adjust goal
              </Link>
            </div>
          </section>
          <SessionTimer />
          <section className="card pad">
            <div className="row">
              <Zap size={22} className="amber" />
              <div>
                <h3>Build understanding, not speed.</h3>
                <p className="subtitle">
                  Predict what happens before pressing Play.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="full section">
              <Link href="/visualizer">
                Enter the visualizer lab
                <ArrowUpRight size={14} />
              </Link>
            </Button>
          </section>
        </aside>
      </div>
    </>
  );
}
