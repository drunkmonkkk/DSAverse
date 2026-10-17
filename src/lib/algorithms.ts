import type { Step } from "./types";
const groups: Record<string, string[]> = {
  Arrays: [
    "array-traversal|Array traversal",
    "array-insertion|Array insertion",
    "array-deletion|Array deletion",
    "array-reversal|Array reversal",
    "array-rotation|Array rotation",
    "array-swap|Swapping",
  ],
  "Data structures": [
    "hashmap|HashMap",
    "hashset|HashSet",
    "stack|Stack",
    "queue|Queue",
    "linked-list|Linked list",
  ],
  Patterns: [
    "sliding-window|Fixed sliding window",
    "variable-window|Variable sliding window",
    "longest-substring|Unique substring",
    "two-pointers|Pair sum",
    "remove-duplicates|Remove duplicates",
    "container-water|Container with most water",
  ],
  "Search & sort": [
    "binary-search|Binary search",
    "bubble-sort|Bubble sort",
    "selection-sort|Selection sort",
    "insertion-sort|Insertion sort",
    "merge-sort|Merge sort",
    "quick-sort|Quick sort",
  ],
  "Trees & graphs": [
    "inorder|Inorder traversal",
    "preorder|Preorder traversal",
    "postorder|Postorder traversal",
    "tree-bfs|Tree level order",
    "graph-bfs|Graph BFS",
    "graph-dfs|Graph DFS",
    "dijkstra|Dijkstra",
  ],
  "Dynamic programming": [
    "fibonacci-memo|Fibonacci memoization",
    "fibonacci|Fibonacci tabulation",
    "coin-change|Coin change",
    "knapsack|0/1 Knapsack",
  ],
};
export const algorithms = Object.entries(groups).flatMap(([category, rows]) =>
  rows.map((row) => {
    const [id, title] = row.split("|");
    return { id, title, category };
  }),
);
export type Options = {
  target?: number;
  k?: number;
  index?: number;
  value?: number;
  operation?: string;
  text?: string;
  edges?: [number, number, number][];
  weights?: number[];
};
export const pseudocode: Record<string, string[]> = {
  "binary-search": [
    "left = 0; right = length - 1",
    "while left <= right:",
    "  mid = left + floor((right-left)/2)",
    "  if a[mid] == target: return mid",
    "  if a[mid] < target: left = mid+1",
    "  else: right = mid-1",
    "return not_found",
  ],
  "bubble-sort": [
    "for end from n-1 down to 1:",
    "  for j from 0 to end-1:",
    "    compare a[j], a[j+1]",
    "    if out of order: swap",
    "return a",
  ],
  "sliding-window": [
    "sum = 0; best = -infinity",
    "for right in indices:",
    "  sum += a[right]",
    "  if right >= k: sum -= a[right-k]",
    "  if right >= k-1: best = max(best,sum)",
    "return best",
  ],
};
export function parseValues(raw: string) {
  if (!raw.trim()) return [];
  const values = raw
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (
    values.length > 24 ||
    values.some((v) => !Number.isSafeInteger(v) || Math.abs(v) > 999)
  )
    throw new Error("Use up to 24 whole numbers between -999 and 999.");
  return values;
}
export function generateSteps(
  id: string,
  input: number[],
  o: Options = {},
): Step[] {
  if (!algorithms.some((x) => x.id === id))
    throw new Error("Unknown algorithm");
  if (
    input.length > 24 ||
    input.some((v) => !Number.isSafeInteger(v) || Math.abs(v) > 999)
  )
    throw new Error("Use up to 24 small integers.");
  const a = [...input],
    steps: Step[] = [];
  let edges: Step["edges"], labels: string[] | undefined;
  const emit = (
    description: string,
    active: number[] = [],
    variables: Step["variables"] = {},
    operation = "inspect",
    line = 1,
    note = "Immutable snapshots make replay and backward stepping reliable.",
  ) =>
    steps.push({
      step_id: steps.length,
      description,
      operation,
      active_elements: [...active],
      highlighted_code_lines: [line],
      variables: { ...variables },
      data_structure_state: [...a],
      complexity_note: note,
      ...(edges
        ? { edges: edges.map((e) => [...e] as [number, number, number?]) }
        : {}),
      ...(labels ? { labels: [...labels] } : {}),
    });
  const target = o.target ?? 10,
    k = o.k ?? 3,
    index = o.index ?? 0,
    value = o.value ?? 9,
    op = o.operation ?? "demo";
  if (
    [target, k, index, value].some(
      (v) => !Number.isSafeInteger(v) || Math.abs(v) > 999,
    )
  )
    throw new Error("Parameters must be integers between -999 and 999.");
  const sorted = () => {
    if (a.some((v, i) => i > 0 && v < a[i - 1]))
      throw new Error("Use values sorted in ascending order.");
  };
  const validIndex = (insert = false) => {
    if (index < 0 || index >= a.length + (insert ? 1 : 0))
      throw new Error("Index is out of bounds.");
  };
  emit(
    "Initial input. Advance to follow the computation.",
    [],
    { size: a.length },
    "start",
  );
  if (id === "array-traversal") {
    let sum = 0;
    a.forEach((v, i) => {
      sum += v;
      emit(`Visit index ${i}; add ${v}.`, [i], { index: i, sum }, "visit");
    });
  } else if (id === "array-insertion") {
    validIndex(true);
    a.push(0);
    for (let j = a.length - 1; j > index; j--) {
      a[j] = a[j - 1];
      emit(`Shift ${j - 1} to ${j}.`, [j - 1, j], { index }, "shift");
    }
    a[index] = value;
    emit(`Insert ${value} at ${index}.`, [index], { value, index }, "insert");
  } else if (id === "array-deletion") {
    validIndex();
    const removed = a[index];
    for (let j = index; j < a.length - 1; j++) {
      a[j] = a[j + 1];
      emit("Shift the suffix left.", [j, j + 1], { removed }, "shift");
    }
    a.pop();
    emit(`Removed ${removed}.`, [], { removed }, "delete");
  } else if (id === "array-reversal") {
    for (let l = 0, r = a.length - 1; l < r; l++, r--) {
      [a[l], a[r]] = [a[r], a[l]];
      emit(
        `Swap indices ${l} and ${r}.`,
        [l, r],
        { left: l, right: r },
        "swap",
      );
    }
  } else if (id === "array-rotation") {
    if (k < 0) throw new Error("Rotation must be nonnegative.");
    if (a.length)
      for (let i = 0; i < k % a.length; i++) {
        a.unshift(a.pop()!);
        emit(
          "Move the final value to the front.",
          [0],
          { rotations: i + 1 },
          "rotate",
        );
      }
  } else if (id === "array-swap") {
    validIndex();
    if (k < 0 || k >= a.length)
      throw new Error("Second index k is out of bounds.");
    [a[index], a[k]] = [a[k], a[index]];
    emit(
      "Exchange the two values.",
      [index, k],
      { first: index, second: k },
      "swap",
    );
  } else if (id === "hashmap" || id === "hashset") {
    type Entry = { key: number; value: number };
    const keys = [...a],
      buckets: Entry[][] = Array.from({ length: 7 }, () => []);
    a.length = 0;
    const hash = (key: number) => ((key % 7) + 7) % 7;
    function render() {
      const flat = buckets.flat();
      a.splice(0, a.length, ...flat.map((e) => e.value));
      labels = flat.map((e) => `${e.key} → b${hash(e.key)}`);
    }
    function find(key: number) {
      const b = hash(key);
      emit(`Hash ${key} into bucket ${b}.`, [], { key, hash: b }, "hash");
      for (const entry of buckets[b]) {
        emit(
          `Compare with key ${entry.key}.`,
          [buckets.flat().indexOf(entry)],
          { key, candidate: entry.key, bucket: b },
          "compare",
        );
        if (entry.key === key) return entry;
      }
      return undefined;
    }
    function insert(key: number, v: number) {
      const entry = find(key),
        b = hash(key),
        collision = !entry && buckets[b].length > 0;
      if (entry) {
        if (id === "hashmap") entry.value = v;
      } else buckets[b].push({ key, value: v });
      render();
      emit(
        entry
          ? id === "hashset"
            ? `Reject duplicate ${key}.`
            : `Update key ${key}.`
          : `Insert ${key}${collision ? " into the collision chain" : ""}.`,
        [buckets.flat().findIndex((e) => e.key === key)],
        { key, hash: b, size: a.length },
        entry ? "update" : "insert",
      );
    }
    for (const key of keys) insert(key, id === "hashmap" ? key * 10 : key);
    if (op === "delete") {
      const entry = find(value);
      if (entry)
        buckets[hash(value)].splice(buckets[hash(value)].indexOf(entry), 1);
      render();
      emit(
        entry ? `Deleted ${value}.` : "Key not found.",
        [],
        { key: value, found: String(!!entry) },
        "delete",
      );
    } else if (op === "insert" || op === "update")
      insert(value, id === "hashmap" ? target : value);
    else {
      const entry = find(value);
      emit(
        entry ? `Found key ${value}.` : "Key not found.",
        entry ? [buckets.flat().indexOf(entry)] : [],
        { key: value, result: entry?.value ?? "not found" },
        "search",
      );
    }
  } else if (id === "stack" || id === "queue") {
    const values = [...a];
    a.length = 0;
    for (const v of values) {
      a.push(v);
      emit(
        `${id === "stack" ? "Push" : "Enqueue"} ${v}.`,
        [a.length - 1],
        { size: a.length },
        "insert",
      );
    }
    if (op === "insert") {
      a.push(value);
      emit(`Insert ${value}.`, [a.length - 1], { value }, "insert");
    } else if (op === "peek") {
      const i = id === "stack" ? a.length - 1 : 0;
      emit(
        a.length ? `Peek: ${a[i]}.` : "Empty structure.",
        a.length ? [i] : [],
        { size: a.length },
        "peek",
      );
    } else {
      const n = op === "delete" ? Math.min(a.length, 1) : a.length;
      for (let i = 0; i < n; i++) {
        const removed = id === "stack" ? a.pop()! : a.shift()!;
        emit(
          `${id === "stack" ? "Pop" : "Dequeue"} ${removed}.`,
          [],
          { removed, size: a.length },
          "remove",
        );
      }
    }
  } else if (id === "linked-list") {
    const nodes = a.map((v, i) => ({
      value: v,
      next: i + 1 < a.length ? i + 1 : -1,
    }));
    let head = a.length ? 0 : -1;
    const links = () => {
      edges = nodes.flatMap((n, i) =>
        n.next < 0 ? [] : [[i, n.next] as [number, number]],
      );
    };
    links();
    emit(
      "Arrows are next pointers; node labels stay fixed.",
      [],
      { head },
      "links",
    );
    if (op === "reverse") {
      let previous = -1,
        current = head;
      while (current !== -1) {
        const next = nodes[current].next;
        nodes[current].next = previous;
        links();
        emit(
          `Redirect node ${current} to ${previous < 0 ? "null" : previous}.`,
          [current],
          { previous, current, next },
          "link",
        );
        previous = current;
        current = next;
      }
      head = previous;
      emit(
        "Set head to the previous tail.",
        head < 0 ? [] : [head],
        { head },
        "done",
      );
    } else if (op === "insert") {
      validIndex(true);
      const next = index === 0 ? head : nodes[index - 1].next;
      const n = nodes.length;
      nodes.push({ value, next });
      a.push(value);
      if (index === 0) head = n;
      else nodes[index - 1].next = n;
      links();
      emit(
        "Splice the new node into the chain.",
        [n],
        { head, index },
        "insert",
      );
    } else if (op === "delete") {
      validIndex();
      if (index === 0) head = nodes[0].next;
      else nodes[index - 1].next = nodes[index].next;
      nodes[index].next = -1;
      links();
      emit(
        "Unlink the node; detached node remains visible.",
        [index],
        { head, deleted: index },
        "delete",
      );
    } else
      for (let i = head; i !== -1; i = nodes[i].next)
        emit(
          `Follow node ${i}.`,
          [i],
          { current: i, next: nodes[i].next },
          "visit",
        );
  } else if (id === "sliding-window") {
    if (k < 1 || k > a.length)
      throw new Error("k must be between 1 and the array length.");
    let sum = 0,
      best = -Infinity;
    for (let r = 0; r < a.length; r++) {
      sum += a[r];
      if (r >= k) sum -= a[r - k];
      if (r >= k - 1) best = Math.max(best, sum);
      const l = Math.max(0, r - k + 1);
      emit(
        `Window [${l}, ${r}] has sum ${sum}.`,
        Array.from({ length: r - l + 1 }, (_, i) => l + i),
        { left: l, right: r, sum, best: best === -Infinity ? "filling" : best },
        "window",
        r >= k - 1 ? 5 : 3,
        "O(n) time and O(1) auxiliary space.",
      );
    }
  } else if (id === "variable-window") {
    if (a.some((v) => v <= 0) || target <= 0)
      throw new Error("Use positive values and target.");
    let l = 0,
      sum = 0,
      best = Infinity;
    for (let r = 0; r < a.length; r++) {
      sum += a[r];
      emit(
        "Expand the right boundary.",
        [l, r],
        { left: l, right: r, sum },
        "expand",
      );
      while (sum >= target) {
        best = Math.min(best, r - l + 1);
        emit(
          "Target reached: record length and shrink.",
          [l, r],
          { left: l, right: r, sum, best },
          "shrink",
        );
        sum -= a[l++];
      }
    }
    emit(
      best === Infinity ? "No qualifying window." : `Minimum length ${best}.`,
      [],
      { result: best === Infinity ? 0 : best },
      "result",
    );
  } else if (id === "longest-substring") {
    const chars = Array.from(o.text ?? "abcabcbb");
    if (chars.length > 24) throw new Error("Use at most 24 characters.");
    a.splice(0, a.length, ...chars.map((c) => c.codePointAt(0)!));
    labels = chars;
    const last = new Map<string, number>();
    let left = 0,
      best = 0;
    chars.forEach((c, right) => {
      left = Math.max(left, (last.get(c) ?? -1) + 1);
      last.set(c, right);
      best = Math.max(best, right - left + 1);
      emit(
        "Keep the window free of repeated characters.",
        Array.from({ length: right - left + 1 }, (_, i) => left + i),
        { left, right, best },
        "window",
      );
    });
  } else if (id === "two-pointers") {
    sorted();
    let l = 0,
      r = a.length - 1,
      found = false;
    while (l < r) {
      const sum = a[l] + a[r];
      emit(
        `Compare sum ${sum} with target ${target}.`,
        [l, r],
        { left: l, right: r, sum },
        "compare",
      );
      if (sum === target) {
        emit("Pair found.", [l, r], { result: "found" }, "found");
        found = true;
        break;
      }
      if (sum < target) l++;
      else r--;
    }
    if (!found)
      emit("No matching pair.", [], { result: "not found" }, "not-found");
  } else if (id === "remove-duplicates") {
    sorted();
    let write = 0;
    for (let read = 0; read < a.length; read++)
      if (write === 0 || a[read] !== a[write - 1]) {
        a[write++] = a[read];
        emit(
          "Copy the next distinct value.",
          [read, write - 1],
          { read, write },
          "write",
        );
      }
    a.length = write;
    emit("Retain the unique prefix.", [], { length: write }, "result");
  } else if (id === "container-water") {
    if (a.some((v) => v < 0)) throw new Error("Heights must be nonnegative.");
    let l = 0,
      r = a.length - 1,
      best = 0;
    while (l < r) {
      const area = (r - l) * Math.min(a[l], a[r]);
      best = Math.max(best, area);
      emit(
        "Record area and move the shorter boundary.",
        [l, r],
        { left: l, right: r, area, best },
        "compare",
      );
      if (a[l] <= a[r]) l++;
      else r--;
    }
    emit(`Maximum area ${best}.`, [], { best }, "result");
  } else if (id === "binary-search") {
    sorted();
    let l = 0,
      r = a.length - 1,
      found = false;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      emit(
        `Inspect midpoint ${mid}: ${a[mid]}.`,
        [mid],
        { left: l, right: r, mid, target },
        "compare",
        3,
      );
      if (a[mid] === target) {
        emit(
          `Found ${target} at index ${mid}.`,
          [mid],
          { result: mid },
          "found",
          4,
        );
        found = true;
        break;
      }
      if (a[mid] < target) {
        l = mid + 1;
        emit(
          "Discard the left half.",
          [mid],
          { left: l, right: r },
          "narrow",
          5,
        );
      } else {
        r = mid - 1;
        emit(
          "Discard the right half.",
          [mid],
          { left: l, right: r },
          "narrow",
          6,
        );
      }
    }
    if (!found)
      emit(
        "The interval is empty: target not found.",
        [],
        { result: -1 },
        "not-found",
        7,
      );
  } else if (id === "bubble-sort") {
    for (let end = a.length - 1; end > 0; end--) {
      let swapped = false;
      for (let j = 0; j < end; j++) {
        emit("Compare adjacent values.", [j, j + 1], { j, end }, "compare", 3);
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          swapped = true;
          emit(
            "Swap the out-of-order pair.",
            [j, j + 1],
            { j, end },
            "swap",
            4,
          );
        }
      }
      if (!swapped) break;
    }
  } else if (id === "selection-sort") {
    for (let i = 0; i < a.length; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) {
        if (a[j] < a[min]) min = j;
        emit(
          "Track the smallest remaining value.",
          [j, min],
          { i, j, min },
          "compare",
        );
      }
      [a[i], a[min]] = [a[min], a[i]];
      emit("Place the minimum.", [i, min], { i, min }, "swap");
    }
  } else if (id === "insertion-sort") {
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        emit("Shift a larger value right.", [j, j + 1], { key, j }, "shift");
        j--;
      }
      a[j + 1] = key;
      emit("Insert in the sorted prefix.", [j + 1], { key }, "insert");
    }
  } else if (id === "merge-sort") {
    function sort(l: number, r: number) {
      if (r - l <= 1) return;
      const m = Math.floor((l + r) / 2);
      sort(l, m);
      sort(m, r);
      const left = a.slice(l, m),
        right = a.slice(m, r);
      let i = 0,
        j = 0;
      for (let out = l; out < r; out++) {
        a[out] =
          j === right.length || (i < left.length && left[i] <= right[j])
            ? left[i++]
            : right[j++];
        emit(
          "Merge the smaller next value.",
          [out],
          { left: l, mid: m, right: r },
          "merge",
        );
      }
    }
    sort(0, a.length);
  } else if (id === "quick-sort") {
    function sort(l: number, r: number) {
      if (l >= r) return;
      const pivot = a[r];
      let p = l;
      for (let j = l; j < r; j++) {
        emit(
          `Compare with pivot ${pivot}.`,
          [j, r],
          { pivot, partition: p },
          "compare",
        );
        if (a[j] < pivot) {
          [a[p], a[j]] = [a[j], a[p]];
          p++;
          emit(
            "Move into the smaller partition.",
            [j, p - 1],
            { pivot },
            "swap",
          );
        }
      }
      [a[p], a[r]] = [a[r], a[p]];
      emit("Place the pivot.", [p], { pivot }, "pivot");
      sort(l, p - 1);
      sort(p + 1, r);
    }
    sort(0, a.length - 1);
  } else if (["inorder", "preorder", "postorder", "tree-bfs"].includes(id)) {
    edges = a.flatMap((_, i) =>
      [2 * i + 1, 2 * i + 2]
        .filter((j) => j < a.length)
        .map((j) => [i, j] as [number, number]),
    );
    const visited: number[] = [];
    const visit = (i: number) => {
      visited.push(a[i]);
      emit(`Visit node ${a[i]}.`, [i], { order: visited.join(" → ") }, "visit");
    };
    if (id === "tree-bfs") {
      const queue = a.length ? [0] : [];
      while (queue.length) {
        const i = queue.shift()!;
        visit(i);
        for (const c of [2 * i + 1, 2 * i + 2]) if (c < a.length) queue.push(c);
      }
    } else {
      function walk(i: number) {
        if (i >= a.length) return;
        if (id === "preorder") visit(i);
        walk(2 * i + 1);
        if (id === "inorder") visit(i);
        walk(2 * i + 2);
        if (id === "postorder") visit(i);
      }
      walk(0);
    }
  } else if (["graph-bfs", "graph-dfs", "dijkstra"].includes(id)) {
    const n = a.length;
    edges =
      o.edges ??
      a.flatMap((_, i) =>
        [i + 1, i + 2]
          .filter((j) => j < n)
          .map((j) => [i, j, 1 + ((i + j) % 5)] as [number, number, number]),
      );
    if (
      edges.length > 576 ||
      edges.some(
        ([u, v, w]) =>
          !Number.isInteger(u) ||
          !Number.isInteger(v) ||
          u < 0 ||
          v < 0 ||
          u >= n ||
          v >= n ||
          !Number.isFinite(w ?? 1) ||
          (w ?? 1) < 0,
      )
    )
      throw new Error(
        "Edges require valid vertex indices and nonnegative weights.",
      );
    const neighbors = (u: number) =>
      edges!.filter((e) => e[0] === u).map((e) => [e[1], e[2] ?? 1]);
    emit("Directed graph: start from vertex 0.", n ? [0] : [], {}, "start");
    if (id === "dijkstra") {
      const distances = Array(n).fill(Infinity),
        done = new Set<number>();
      if (n) distances[0] = 0;
      for (let round = 0; round < n; round++) {
        let u = -1;
        for (let v = 0; v < n; v++)
          if (!done.has(v) && (u === -1 || distances[v] < distances[u])) u = v;
        if (u < 0 || distances[u] === Infinity) break;
        done.add(u);
        emit(`Finalize ${u}.`, [u], { distance: distances[u] }, "finalize");
        for (const [v, w] of neighbors(u))
          if (distances[u] + w < distances[v]) {
            distances[v] = distances[u] + w;
            emit(
              `Relax edge ${u} → ${v}.`,
              [u, v],
              {
                distances: distances
                  .map((d) => (d === Infinity ? "∞" : d))
                  .join(", "),
              },
              "relax",
            );
          }
      }
      emit(
        "Shortest distances from vertex 0.",
        [],
        {
          distances: distances
            .map((d) => (d === Infinity ? "∞" : d))
            .join(", "),
        },
        "result",
        1,
        "This scan-based implementation takes O(V² + E) time.",
      );
    } else {
      const frontier = n ? [0] : [],
        seen = new Set(frontier),
        order: number[] = [];
      while (frontier.length) {
        const u = id === "graph-bfs" ? frontier.shift()! : frontier.pop()!;
        order.push(u);
        for (const [v] of neighbors(u))
          if (!seen.has(v)) {
            seen.add(v);
            frontier.push(v);
          }
        emit(
          `Visit vertex ${u}.`,
          [u],
          {
            frontier: frontier.join(", ") || "empty",
            order: order.join(" → "),
          },
          "visit",
        );
      }
    }
  } else if (id === "fibonacci" || id === "fibonacci-memo") {
    if (k < 0 || k > 20) throw new Error("Use n from 0 to 20.");
    a.splice(0, a.length, ...Array(k + 1).fill(-1));
    if (id === "fibonacci") {
      a[0] = 0;
      if (k >= 1) a[1] = 1;
      emit("Initialize base cases.", k ? [0, 1] : [0], {}, "base");
      for (let i = 2; i <= k; i++) {
        a[i] = a[i - 1] + a[i - 2];
        emit(
          `F(${i}) = ${a[i]}.`,
          [i - 2, i - 1, i],
          { i, value: a[i] },
          "compute",
        );
      }
    } else {
      function fib(n: number): number {
        if (a[n] !== -1) {
          emit(`Reuse F(${n}).`, [n], { n, value: a[n] }, "cache-hit");
          return a[n];
        }
        a[n] = n < 2 ? n : fib(n - 1) + fib(n - 2);
        emit(`Cache F(${n}).`, [n], { n, value: a[n] }, "cache-write");
        return a[n];
      }
      fib(k);
    }
  } else if (id === "coin-change") {
    if (target < 0 || target > 40 || a.some((v) => v <= 0))
      throw new Error("Use positive coins and amount 0–40.");
    const coins = [...new Set(a)];
    a.splice(0, a.length, ...Array(target + 1).fill(target + 1));
    a[0] = 0;
    for (let amount = 1; amount <= target; amount++)
      for (const coin of coins)
        if (coin <= amount && a[amount - coin] + 1 < a[amount]) {
          a[amount] = a[amount - coin] + 1;
          emit(
            `Use coin ${coin} for amount ${amount}.`,
            [amount - coin, amount],
            { coin, amount, best: a[amount] },
            "relax",
          );
        }
    emit(
      a[target] > target
        ? "Unreachable amount."
        : `Minimum coins: ${a[target]}.`,
      [target],
      { result: a[target] > target ? -1 : a[target], sentinel: target + 1 },
      "result",
    );
  } else if (id === "knapsack") {
    if (target < 0 || target > 40) throw new Error("Use capacity 0–40.");
    const values = [...a],
      weights = o.weights ?? a.map((_, i) => i + 1);
    if (
      weights.length !== a.length ||
      weights.some((w) => !Number.isSafeInteger(w) || w < 1)
    )
      throw new Error("Provide one positive weight per value.");
    a.splice(0, a.length, ...Array(target + 1).fill(0));
    for (let i = 0; i < values.length; i++)
      for (let capacity = target; capacity >= weights[i]; capacity--) {
        a[capacity] = Math.max(
          a[capacity],
          a[capacity - weights[i]] + values[i],
        );
        emit(
          `Consider item ${i}.`,
          [capacity],
          {
            item: i,
            capacity,
            weight: weights[i],
            value: values[i],
            best: a[capacity],
          },
          "compute",
        );
      }
    emit(
      `Best value: ${a[target]}.`,
      [target],
      { result: a[target] },
      "result",
    );
  }
  if (
    !["found", "not-found", "result", "done"].includes(steps.at(-1)!.operation)
  )
    emit("Computation complete.", [], steps.at(-1)!.variables, "done");
  return steps;
}
