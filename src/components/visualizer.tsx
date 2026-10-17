"use client";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  algorithms,
  generateSteps,
  parseValues,
  pseudocode,
} from "@/lib/algorithms";
import { Heading } from "./widgets";
export function VisualizerLibrary() {
  return (
    <>
      <Heading
        title="See the logic unfold"
        description="34 interactive experiments. Change the input, inspect every step, and build intuition."
      />
      <div className="tiles">
        {algorithms.map((a) => (
          <Link
            className="card pad tile"
            href={`/visualizer/${a.id}`}
            key={a.id}
          >
            <span className="eyebrow">{a.category}</span>
            <h2>{a.title}</h2>
            <p>Open interactive lab →</p>
          </Link>
        ))}
      </div>
    </>
  );
}
export function Visualizer({ id }: { id: string }) {
  const [raw, setRaw] = useState("1, 3, 4, 6, 8"),
    [target, setTarget] = useState(8),
    [k, setK] = useState(3),
    [index, setIndex] = useState(0),
    [value, setValue] = useState(9),
    [operation, setOperation] = useState("demo"),
    [text, setText] = useState("abcabcbb"),
    [edgeText, setEdgeText] = useState(""),
    [steps, setSteps] = useState(() =>
      generateSteps(id, [1, 3, 4, 6, 8], { target: 8 }),
    ),
    [cursor, setCursor] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(700),
    [error, setError] = useState("");
  const marker = useId().replaceAll(":", "");
  useEffect(() => {
    if (!playing || cursor === steps.length - 1) return;
    const timer = setTimeout(
      () => setCursor((c) => Math.min(c + 1, steps.length - 1)),
      speed,
    );
    return () => clearTimeout(timer);
  }, [playing, speed, steps.length, cursor]);
  function run() {
    setPlaying(false);
    try {
      const edges = edgeText.trim()
        ? edgeText.split(";").map((row) => {
            const parts = row.trim().split(",").map(Number);
            if (parts.length !== 3)
              throw Error("Each edge needs source,destination,weight.");
            return parts as [number, number, number];
          })
        : undefined;
      setSteps(
        generateSteps(id, parseValues(raw), {
          target,
          k,
          index,
          value,
          operation,
          text,
          edges,
        }),
      );
      setCursor(0);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const step = steps[cursor],
    n = step.data_structure_state.length;
  const pos = (i: number) => ({
    x: 45 + (i % 6) * 90,
    y: 45 + Math.floor(i / 6) * 90,
  });
  return (
    <>
      <Heading
        title={algorithms.find((a) => a.id === id)!.title}
        description="Every frame is a snapshot of the actual algorithm state."
      />
      <div className="card pad">
        <div className="form-grid">
          <label className="field wide">
            Input values
            <input value={raw} onChange={(e) => setRaw(e.target.value)} />
          </label>
          {[
            ["Target", target, setTarget],
            ["Window / capacity / n", k, setK],
            ["Index", index, setIndex],
            ["Value", value, setValue],
          ].map(([label, v, set]) => (
            <label className="field" key={String(label)}>
              {String(label)}
              <input
                type="number"
                value={v as number}
                onChange={(e) =>
                  (set as (n: number) => void)(Number(e.target.value))
                }
              />
            </label>
          ))}
          <label className="field">
            Operation
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
            >
              {[
                "demo",
                "insert",
                "delete",
                "search",
                "update",
                "peek",
                "reverse",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          {id === "longest-substring" && (
            <label className="field">
              Text
              <input value={text} onChange={(e) => setText(e.target.value)} />
            </label>
          )}
          {["graph-bfs", "graph-dfs", "dijkstra"].includes(id) && (
            <label className="field wide">
              Directed edges (optional: 0,1,4; 1,2,2)
              <input
                value={edgeText}
                onChange={(e) => setEdgeText(e.target.value)}
              />
            </label>
          )}
        </div>
        <p className="subtitle">
          Only parameters used by this algorithm apply. Knapsack uses weights
          1…n; graph vertices are array indices.
        </p>
        <button className="button primary" onClick={run}>
          Apply input
        </button>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </div>
      <section className="card pad section">
        <div className="between">
          <span className="pill accent">{step.operation}</span>
          <small>
            Step {cursor + 1} / {steps.length}
          </small>
        </div>
        <div className="visual-stage">
          {step.edges ? (
            <svg
              viewBox={`0 0 550 ${Math.max(150, Math.ceil(n / 6) * 90)}`}
              role="img"
              aria-label="Nodes and directed edges"
              style={{ width: "100%", maxHeight: 420 }}
            >
              <defs>
                <marker
                  id={marker}
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" />
                </marker>
              </defs>
              {step.edges.map(([a, b, w], i) => {
                const p = pos(a),
                  q = pos(b);
                return (
                  <g key={i}>
                    <line
                      x1={p.x}
                      y1={p.y}
                      x2={q.x}
                      y2={q.y - 23}
                      stroke="#a78bfa"
                      markerEnd={`url(#${marker})`}
                    />
                    {w !== undefined && (
                      <text
                        x={(p.x + q.x) / 2 + 7}
                        y={(p.y + q.y) / 2}
                        fill="#a1a1aa"
                        fontSize="12"
                      >
                        {w}
                      </text>
                    )}
                  </g>
                );
              })}
              {step.data_structure_state.map((v, i) => {
                const p = pos(i);
                return (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="23"
                      fill={
                        step.active_elements.includes(i) ? "#7c3aed" : "#272735"
                      }
                      stroke="#a78bfa"
                    />
                    <text x={p.x} y={p.y + 5} textAnchor="middle" fill="white">
                      {step.labels?.[i] ?? v}
                    </text>
                    <text
                      x={p.x}
                      y={p.y + 38}
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="10"
                    >
                      {i}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="cells">
              {step.data_structure_state.map((v, i) => (
                <div
                  className={`cell ${step.active_elements.includes(i) ? "active" : ""}`}
                  key={i}
                >
                  <span>{step.labels?.[i] ?? v}</span>
                  <small>{i}</small>
                </div>
              ))}
              {!n && <p>Empty structure</p>}
            </div>
          )}
        </div>
        <p aria-live="polite">{step.description}</p>
        <div className="row wrap controls">
          <button
            className="button outline"
            onClick={() => {
              setPlaying(false);
              setCursor(0);
            }}
          >
            Reset
          </button>
          <button
            className="button outline"
            disabled={!cursor}
            onClick={() => {
              setPlaying(false);
              setCursor(cursor - 1);
            }}
          >
            Back
          </button>
          <button
            className="button primary"
            onClick={() => {
              if (cursor === steps.length - 1) setCursor(0);
              setPlaying(cursor === steps.length - 1 ? true : !playing);
            }}
          >
            {playing && cursor < steps.length - 1 ? "Pause" : "Play"}
          </button>
          <button
            className="button outline"
            disabled={cursor === steps.length - 1}
            onClick={() => {
              setPlaying(false);
              setCursor(cursor + 1);
            }}
          >
            Next
          </button>
          <label>
            Speed{" "}
            <select
              aria-label="Playback speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={1400}>Slow</option>
              <option value={700}>Normal</option>
              <option value={250}>Fast</option>
            </select>
          </label>
        </div>
        <input
          aria-label="Step position"
          type="range"
          min="0"
          max={steps.length - 1}
          value={cursor}
          onChange={(e) => {
            setPlaying(false);
            setCursor(Number(e.target.value));
          }}
          style={{ width: "100%" }}
        />
        <div className="row wrap">
          {Object.entries(step.variables).map(([key, v]) => (
            <span className="pill" key={key}>
              {key}: {v}
            </span>
          ))}
        </div>
        <p className="subtitle">{step.complexity_note}</p>
        {pseudocode[id] && (
          <pre className="pseudo">
            {pseudocode[id].map((line, i) => (
              <span
                key={i}
                className={
                  step.highlighted_code_lines.includes(i + 1) ? "active" : ""
                }
              >
                {i + 1} {line}
                {"\n"}
              </span>
            ))}
          </pre>
        )}
      </section>
    </>
  );
}
