import { describe, it, expect } from "vitest";
import { algorithms, generateSteps, parseValues } from "../src/lib/algorithms";
import { topics, validateGraph } from "../src/data/curriculum";
import { problems } from "../src/data/problems";
import {
  emptyProgress,
  completeTopic,
  setProblemStatus,
  streaks,
  aggregateDays,
  makePlan,
  isProgress,
  parseProgress,
} from "../src/lib/progress";
describe("catalog integrity", () => {
  it("has unique valid content and acyclic prerequisites", () => {
    expect(topics).toHaveLength(102);
    expect(problems).toHaveLength(172);
    expect(validateGraph(topics)).toBe(true);
    expect(new Set(problems.map((p) => p.id)).size).toBe(172);
    for (const p of problems) {
      expect(p.problem_url).toMatch(/^https:\/\/leetcode.com\/problems\//);
      for (const id of p.prerequisites)
        expect(topics.some((t) => t.id === id)).toBe(true);
    }
  });
});
describe("algorithm traces", () => {
  for (const a of algorithms)
    it(`${a.id} generates isolated snapshots`, () => {
      const input = [1, 3, 4, 6, 8];
      const s = generateSteps(a.id, input);
      expect(s.length).toBeGreaterThan(1);
      expect(input).toEqual([1, 3, 4, 6, 8]);
      const previous = [...s[1].data_structure_state];
      s[0].data_structure_state.push(999);
      expect(s[1].data_structure_state).toEqual(previous);
    });
  for (const id of [
    "bubble-sort",
    "selection-sort",
    "insertion-sort",
    "merge-sort",
    "quick-sort",
  ])
    it(`${id} sorts negatives and duplicates`, () => {
      expect(
        generateSteps(id, [4, -2, 4, 0, -9]).at(-1)?.data_structure_state,
      ).toEqual([-9, -2, 0, 4, 4]);
    });
  it("finds and misses binary search targets", () => {
    expect(
      generateSteps("binary-search", [1, 4, 8], { target: 8 }).at(-1)?.variables
        .result,
    ).toBe(2);
    expect(
      generateSteps("binary-search", [1, 4, 8], { target: 9 }).at(-1)?.variables
        .result,
    ).toBe(-1);
    expect(() => generateSteps("binary-search", [4, 1])).toThrow(/sorted/);
  });
  it("validates parsing and windows", () => {
    expect(() => parseValues("1,nope")).toThrow();
    expect(() => generateSteps("sliding-window", [1], { k: 2 })).toThrow();
    expect(
      generateSteps("sliding-window", [-3, -2, -8], { k: 2 }).findLast(
        (s) => "best" in s.variables,
      )?.variables.best,
    ).toBe(-5);
  });
  it("traverses cycles and handles unreachable vertices", () => {
    const edges: [number, number, number][] = [
      [0, 1, 2],
      [1, 0, 2],
    ];
    const steps = generateSteps("graph-bfs", [0, 1, 2], { edges });
    expect(steps.filter((s) => s.operation === "visit")).toHaveLength(2);
    expect(
      generateSteps("dijkstra", [0, 1, 2], { edges }).at(-1)?.variables
        .distances,
    ).toBe("0, 2, ∞");
  });
});
describe("learning state", () => {
  it("starts empty and rejects malformed saves", () => {
    expect(isProgress(emptyProgress())).toBe(true);
    expect(parseProgress(null).events).toHaveLength(0);
    expect(() => parseProgress('{"version":1}')).toThrow();
  });
  it("enforces prerequisites and awards only once", () => {
    const p = emptyProgress(),
      first = topics[0],
      second = topics[1];
    expect(completeTopic(p, second)).toBe(p);
    const next = completeTopic(p, first);
    expect(completeTopic(next, first).events).toHaveLength(1);
    expect(
      setProblemStatus(
        setProblemStatus(p, "two-sum", "SOLVED"),
        "two-sum",
        "SOLVED",
      ).events,
    ).toHaveLength(1);
  });
  it("plans only available topics", () => {
    const p = emptyProgress();
    for (const t of makePlan(topics, p))
      expect(t.prerequisites).toHaveLength(0);
  });
  it("uses calendar dates across DST and deduplicates events", () => {
    const events = [
      "2026-03-07T17:00:00Z",
      "2026-03-08T16:00:00Z",
      "2026-03-09T16:00:00Z",
    ].map((at, i) => ({
      id: String(i),
      kind: "session" as const,
      target: "focus",
      at,
      minutes: 10,
      xp: 20,
    }));
    expect(
      streaks(events, "America/New_York", new Date("2026-03-10T16:00:00Z"))
        .current,
    ).toBe(3);
    expect(
      Object.values(
        aggregateDays([...events, events[0]], "America/New_York"),
      ).reduce((n, d) => n + d.minutes, 0),
    ).toBe(30);
  });
});
