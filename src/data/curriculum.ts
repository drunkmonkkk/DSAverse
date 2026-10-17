import type { Topic } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { codeFor } from "./examples";
// Original, concise teaching notes. Detailed expansions are tracked in TASKS.md.
const chapters = [
  [
    "Programming fundamentals",
    `Variables|A variable names a value so later expressions can refer to it. Assignment replaces that value.|A running total starts at zero and grows with each item.
Data types|Types determine valid values and operations. Integers count discrete things; floating point approximates real numbers.|Use an integer index and a boolean found flag.
Operators|Arithmetic, comparison, and logical operators combine values. Parentheses make precedence explicit.|Compute (left + right) / 2 after adding the boundaries.
Conditionals|A boolean condition chooses which branch executes. Exhaustive mutually exclusive branches avoid conflicting updates.|Compare two distances and retain the smaller one.
Loops|A loop repeats work while its state approaches a stopping condition. State an invariant before writing the body.|Visit indices 0 through n−1 exactly once.
Functions|A function separates a computation from its caller through inputs and a result. Pure functions make tests predictable.|Return the maximum without modifying the original array.
Scope|Scope determines where names are visible. Local state belongs to one function invocation.|Initialize an accumulator inside the function to avoid state leaking between calls.
Input/output|Parse input text, validate it, compute a result, and format output separately.|Reject a nonnumeric token before adding it to an integer array.
Basic recursion|Solve a smaller instance of the same problem until reaching a base case. Every branch must decrease a measure.|factorial(4) = 4 × factorial(3), with factorial(0) = 1.
Time complexity|Count how operations grow with input size rather than measuring one machine's speed.|One full scan is O(n); two nested full scans are O(n²).
Space complexity|Count extra storage, including recursive call frames. Distinguish auxiliary memory from the input.|An in-place reversal uses O(1) auxiliary storage.
Big O notation|Big O is an asymptotic upper bound. State whether the bound is worst-case, expected, or amortized.|Halving a search interval repeatedly takes O(log n) comparisons.`,
  ],
  [
    "Arrays & strings",
    `Arrays|An array is an indexed sequence. Access is constant time; shifting a suffix costs linear time.|In [3, 8, 2], index 1 contains 8.
Array traversal|Process each element while maintaining a summary of the processed prefix.|The running sums of [3, 8, 2] are 3, 11, 13.
Insertion and deletion|Insertion shifts later elements right to make a gap; deletion shifts them left to close one.|Insert 5 at index 1 in [3, 8] to obtain [3, 5, 8].
Array rotation|Move a suffix to the beginning or a prefix to the end. Normalize the shift modulo the length.|Right-rotate [1, 2, 3, 4] by one: [4, 1, 2, 3].
Array reversal|Swap symmetric pairs while moving inward. Every swap fixes two final positions.|[2, 4, 6] becomes [6, 4, 2].
Prefix sums|Store a leading zero followed by cumulative sums. A half-open range [l, r) sums to prefix[r] − prefix[l].|For [2, 3, 4], prefix is [0, 2, 5, 9]; [1, 3) sums to 7.
Suffix sums|Accumulate from the right to answer sums from an index to the end.|The suffix sums of [2, 3, 4] are [9, 7, 4].
Difference arrays|Record range changes only at boundaries, then take a prefix sum to recover values.|Add 2 over inclusive [1, 2] by adding at 1 and subtracting at 3.
Strings|Text can be represented as bytes, code points, or graphemes. Their lengths need not agree.|A palindrome has the same sequence forward and backward.
String manipulation|Slicing, joining, and replacing transform text. Repeated concatenation can copy an increasingly large prefix.|Collect many fragments and join once to avoid quadratic copying.
Character frequency|Associate each character with a count. Equal frequency signatures can identify anagrams.|listen and silent have the same character counts.
String matching fundamentals|Compare a pattern against candidate positions. Naive matching can take O(nm) comparisons.|aba occurs at indices 0 and 2 in ababa.`,
  ],
  [
    "Hashing",
    `Hash functions|Map a key to a bucket index. Equal keys require equal hashes, but distinct keys can collide.|Integer key modulo 7 chooses one of seven buckets.
HashMap|Associate unique keys with values. An insertion with an existing key replaces its value.|Store each number's prior index to find a Two Sum complement.
HashSet|Store distinct keys and check membership. Repeating an insertion does not grow the set.|Inserting 3, 3, 5 leaves {3, 5}.
Frequency maps|Use map values as counts. Increment on arrival and decrement on removal.|[2, 2, 4] produces counts {2: 2, 4: 1}.
Collision handling|Separate chaining keeps colliding keys in one bucket list. Compare keys to distinguish entries.|Keys 2 and 9 both map to bucket 2 in a seven-bucket table.
Hash table operations|Hash to a bucket, then compare keys for lookup, insertion, or deletion. Resize as load grows.|Doubling capacity requires rehashing entries into the new buckets.
Common hashing patterns|Choose keys that represent complements, groups, counts, or previously seen states.|Two equal prefix sums delimit a zero-sum subarray.`,
  ],
  [
    "Problem-solving patterns",
    `Two pointers|Move indices while preserving an invariant. Sorted order can tell you which pointer to advance.|In [1, 3, 5, 8], target 9 is found as 1 + 8.
Sliding window|Maintain information about a contiguous range while its boundaries move.|Update a sum using only the arriving and departing values.
Fixed-size sliding window|Keep exactly k elements by subtracting the departing value and adding the arriving value.|Length-2 sums of [2, 1, 5] are 3 and 6.
Variable-size sliding window|Expand right and shrink left until a monotone validity condition is restored.|For positive values, shrink a range while its sum meets the target.
Fast and slow pointers|Advance pointers at different speeds. Within a cycle they eventually meet.|Floyd's cycle detection uses constant extra memory.
Prefix sum patterns|Convert a range property into a difference between two prefix states.|Count earlier sums equal to currentSum − target.
Kadane's algorithm|The best subarray ending here either extends the previous best suffix or starts at this value.|[-2, 3, -1, 4] has maximum sum 6 from [3, -1, 4].
Binary search|Maintain a sorted candidate interval, inspect its midpoint, and discard an impossible half.|Search 7 in [1, 3, 7, 9]: inspect 3, then 7.
Binary search on answer|Search an ordered answer space using a monotone feasibility predicate.|Find the smallest shipping capacity that meets a day limit.
Sorting techniques|Sorting simplifies comparisons and grouping. Compare stability, extra memory, and worst-case guarantees.|Merge sort guarantees O(n log n) time with O(n) extra storage.
Intervals|Sort by a boundary and reason about overlap. Decide whether touching endpoints count as overlapping.|Merge [1, 4] and [3, 6] into [1, 6].
Monotonic stack|Keep ordered candidates and discard a candidate when a new value dominates it.|Find next-greater elements in O(n) amortized time.
Monotonic queue|Expire old indices from the front and discard dominated candidates from the back.|A decreasing deque exposes each sliding-window maximum.`,
  ],
  [
    "Linear data structures",
    `Stack|Remove the most recently inserted element first. LIFO order models nested work.|Push 4 then 7; pop returns 7.
Queue|Remove the oldest inserted element first. Use a ring buffer or deque to avoid shifting.|Enqueue 4 then 7; dequeue returns 4.
Deque|Insert and remove at either end of a double-ended queue.|Put urgent work at the front and routine work at the back.
Linked list|Nodes store values and links to successors. Finding a node is linear; splicing beside a known node is constant time.|Insert C between A and B by redirecting A.next to C and C.next to B.
Doubly linked list|Nodes link to predecessors and successors. Updating both neighbors allows deletion of a known node.|An LRU cache combines a hash map with a doubly linked list.
Circular linked list|The last node links to the first. Stop traversal when returning to the starting node.|Round-robin scheduling repeatedly cycles through active tasks.
Circular queue|Wrap buffer indices modulo capacity. Track size to distinguish full from empty.|Reuse a dequeued slot for a new arrival.
Priority queue|Remove by priority rather than insertion time. A binary heap supports logarithmic insertion and removal.|Process the smallest pending distance first.`,
  ],
  [
    "Recursion & backtracking",
    `Recursion trees|Represent each recursive subproblem as a child. Sum work across levels to analyze cost.|Merge sort makes two half-sized subproblems per call.
Call stack|Active calls store local state and a return address. Deep recursion consumes stack memory.|A recursive chain of depth n uses O(n) frames.
Base cases|Answer the smallest inputs directly. Every recursive path must reach a base case.|The sum of an empty list is zero.
Subsets|Branch on whether to include each element. There are 2^n subsets of n distinct values.|[1, 2] yields [], [1], [2], and [1, 2].
Permutations|Choose an unused element for each position, then restore the used state when returning.|Three distinct values have 3! = 6 permutations.
Combinations|Choose k values in increasing index order to avoid duplicate orderings.|Choose two from [1, 2, 3]: [1, 2], [1, 3], [2, 3].
Backtracking|Build a candidate, prune invalid prefixes, and undo each choice before trying another.|Mark a maze cell, explore, then restore the mark when returning.
N-Queens|Place one queen per row while tracking occupied columns and diagonals.|For n = 4, columns [1, 3, 0, 2] form a valid solution.
Sudoku solver|Try allowed digits in an empty cell and undo failed choices. Choose constrained cells first.|A candidate must be absent from its row, column, and 3×3 box.`,
  ],
  [
    "Trees",
    `Binary tree|Each node has at most two children. Recursively combine results from child subtrees.|An expression tree places an operator above its operands.
Binary search tree|For distinct keys, all left-subtree keys are smaller and all right-subtree keys are larger.|Compare a target with the current key to choose a child.
Tree traversal|Choose when to process a node relative to its children.|Postorder computes child results before processing the parent.
Inorder traversal|Visit left subtree, node, then right subtree. A BST yields sorted keys.|Root 2 with children 1 and 3 visits 1, 2, 3.
Preorder traversal|Visit the node before both subtrees. Null markers make serialization unambiguous.|Root 2 with children 1 and 3 visits 2, 1, 3.
Postorder traversal|Visit both subtrees before their parent.|Root 2 with children 1 and 3 visits 1, 3, 2.
Level order traversal|Use a queue to process nodes by distance from the root.|Visit the root, its children, then grandchildren.
Tree height|Height is the longest downward path. Specify whether you count nodes or edges.|With node-count height, null is 0 and a leaf is 1.
Tree diameter|Combine left and right heights at each node while tracking the best path.|A chain of four nodes has edge-count diameter 3.
Lowest common ancestor|Find the deepest node whose subtree contains both targets.|If targets lie in opposite child subtrees, the current node is their LCA.
Balanced trees|Maintain logarithmic height through rotations and balance invariants.|A rotation preserves BST key order while changing subtree heights.
Heaps|A complete tree maintains a parent-child priority relation, not global sorting.|Children of zero-based index i are 2i+1 and 2i+2.
Tries|Store shared string prefixes as shared paths.|car and cat share the edges c → a.`,
  ],
  [
    "Graphs",
    `Graph representation|Vertices and edges model relationships. Decide direction and weights to match the problem.|Road intersections are vertices and road lengths are edge weights.
Adjacency matrix|A V-by-V matrix supports constant-time edge checks at quadratic storage cost.|matrix[u][v] records a directed edge u → v.
Adjacency list|Store neighbors of each vertex. Sparse graphs need O(V + E) storage.|Store both directions for an undirected edge.
BFS|A FIFO frontier visits vertices in increasing unweighted distance. Mark when enqueuing.|All distance-1 vertices are processed before distance-2 vertices.
DFS|Explore one branch deeply before returning. Track visited vertices to handle cycles.|Use recursion or an explicit stack to explore a connected component.
Connected components|Start a traversal from every still-unvisited vertex of an undirected graph.|Two isolated vertices and one connected pair form three components.
Cycle detection|Distinguish active traversal vertices from finished ones. In undirected DFS, ignore the parent edge.|An edge to an active vertex reveals a directed cycle.
Topological sorting|Order a DAG so prerequisites precede dependents. Repeatedly remove zero-indegree vertices.|If fewer than V vertices are removed, the directed graph has a cycle.
Union Find / DSU|Represent disjoint sets by parent links. Path compression and union by size reduce future work.|Joining endpoints already in the same set would create a cycle.
Dijkstra's algorithm|Finalize the unsettled vertex with minimum tentative distance, then relax its outgoing edges.|The algorithm requires nonnegative weights.
Bellman-Ford|Relax all edges up to V−1 times. A further reachable improvement detects a negative cycle.|It supports negative weights, unlike Dijkstra.
Floyd-Warshall|Try each vertex as an intermediate for every source-destination pair.|Update d[i][j] with min(d[i][j], d[i][k] + d[k][j]).
Minimum spanning tree|Connect an undirected weighted graph with minimum total edge cost and no cycles.|A spanning tree of V vertices contains V−1 edges.
Prim's algorithm|Grow a tree using the cheapest edge crossing to an outside vertex.|Maintain crossing edges in a min-priority queue.
Kruskal's algorithm|Sort edges by weight; accept an edge only when it joins different components.|Use DSU to test whether the endpoints are already connected.`,
  ],
  [
    "Advanced algorithms",
    `Greedy algorithms|Make a locally optimal choice only when an invariant or exchange argument proves it safe.|Earliest-finish interval selection maximizes nonoverlapping meetings.
Dynamic programming|Define a state, recurrence, base cases, and dependency order for overlapping subproblems.|Coin change stores the best answer for each smaller amount.
Memoization|Cache recursive results by the complete state, then reuse repeated subproblems.|Fibonacci avoids recomputing an exponential call tree.
Tabulation|Evaluate states iteratively after their dependencies.|Initialize F(0) = 0 and F(1) = 1, then fill increasing indices.
0/1 Knapsack|For each item, choose skip or take once. Update capacities downward to avoid reusing an item.|Weights [2, 3], values [3, 4], capacity 5 produce value 7.
Longest common subsequence|Match equal trailing characters or discard one side. A subsequence need not be contiguous.|abcde and ace have LCS length 3.
Longest increasing subsequence|Track the best increasing sequence ending at each index or maintain minimal possible tails.|[3, 1, 2, 5] has LIS [1, 2, 5].
Interval DP|Store answers for contiguous intervals and try all final splits. Compute shorter intervals first.|Matrix-chain multiplication chooses the cheapest parenthesization.
Bit manipulation|Use masks to test, set, clear, and toggle binary positions.|x & (x−1) clears the lowest set bit of positive x.
Bitmasking|Encode a small set as bits. Tracking every subset needs exponential state space.|Mask 101 represents elements 0 and 2.
Segment trees|Store aggregates over nested intervals. Queries and point updates touch logarithmically many nodes.|Combine child sums into their parent's range sum.
Fenwick trees|Store partial sums and move through one-based indices using the lowest set bit.|Update with i += i & -i; query with i -= i & -i.
Advanced string algorithms|Reuse prefix matches to avoid restarting comparisons. KMP and Z process strings in linear time.|KMP falls back to the longest matching proper prefix after a mismatch.`,
  ],
] as const;
export const categories = chapters.map((c) => c[0]);
const roots: Record<string, string[]> = {
  arrays: ["loops", "big-o-notation"],
  "hash-functions": ["arrays"],
  "two-pointers": ["arrays"],
  stack: ["arrays"],
  "recursion-trees": ["basic-recursion"],
  "binary-tree": ["linked-list", "basic-recursion"],
  "graph-representation": ["arrays"],
  "greedy-algorithms": ["sorting-techniques"],
};
const overrides: Record<string, string[]> = {
  ...roots,
  "basic-recursion": ["functions"],
  "input-output": ["data-types"],
  "time-complexity": ["loops"],
  strings: ["arrays"],
  "sliding-window": ["arrays"],
  "binary-search": ["arrays"],
  "sorting-techniques": ["arrays", "basic-recursion"],
  queue: ["arrays"],
  deque: ["queue"],
  "linked-list": ["variables", "basic-recursion"],
  "priority-queue": ["heaps"],
  "fast-and-slow-pointers": ["linked-list"],
  "monotonic-stack": ["stack"],
  "monotonic-queue": ["deque"],
  "dynamic-programming": ["arrays", "basic-recursion"],
  memoization: ["dynamic-programming"],
  tabulation: ["dynamic-programming"],
  heaps: ["binary-tree"],
  bfs: ["adjacency-list", "queue"],
  dfs: ["adjacency-list", "stack"],
  "inorder-traversal": ["tree-traversal"],
  "preorder-traversal": ["tree-traversal"],
  "postorder-traversal": ["tree-traversal"],
  "level-order-traversal": ["binary-tree", "queue"],
  "bit-manipulation": ["operators"],
};
const visuals: Record<string, string> = {
  arrays: "array-traversal",
  "array-traversal": "array-traversal",
  "insertion-and-deletion": "array-insertion",
  "array-reversal": "array-reversal",
  "array-rotation": "array-rotation",
  "hash-functions": "hashmap",
  hashmap: "hashmap",
  hashset: "hashset",
  "collision-handling": "hashmap",
  stack: "stack",
  queue: "queue",
  "linked-list": "linked-list",
  "sliding-window": "sliding-window",
  "fixed-size-sliding-window": "sliding-window",
  "variable-size-sliding-window": "variable-window",
  "two-pointers": "two-pointers",
  "binary-search": "binary-search",
  "sorting-techniques": "bubble-sort",
  "inorder-traversal": "inorder",
  "preorder-traversal": "preorder",
  "postorder-traversal": "postorder",
  "level-order-traversal": "tree-bfs",
  bfs: "graph-bfs",
  dfs: "graph-dfs",
  "dijkstra-s-algorithm": "dijkstra",
  "dynamic-programming": "coin-change",
  memoization: "fibonacci-memo",
  tabulation: "fibonacci",
  "0-1-knapsack": "knapsack",
};
export const topics: Topic[] = chapters.flatMap(([category, lines], level) =>
  lines.split("\n").map((row, index, rows) => {
    const [title, explanation, example] = row.split("|");
    const id = slugify(title);
    return {
      id,
      slug: id,
      title,
      description: explanation,
      explanation,
      category,
      level,
      difficulty: level < 3 ? "Easy" : level < 8 ? "Medium" : "Hard",
      prerequisites:
        overrides[id] ??
        (index ? [slugify(rows[index - 1].split("|")[0])] : []),
      estimated_minutes: level < 3 ? 15 : 25,
      learning_objectives: [
        `Explain ${title.toLowerCase()} in your own words.`,
        `Trace the example and predict a changed input.`,
        `Identify assumptions and boundary cases.`,
      ],
      examples: [example],
      common_mistakes: [
        "Ignoring empty inputs and boundary conditions.",
        "Applying the method without checking its assumptions.",
      ],
      time_complexity:
        id === "binary-search"
          ? "O(log n)"
          : id === "hashmap" || id === "hashset"
            ? "O(1) expected; O(n) worst per operation"
            : "Depends on the operation and implementation described above.",
      space_complexity:
        id === "binary-search"
          ? "O(1)"
          : "Count stored state and recursive call frames.",
      visualizer_type: visuals[id] ?? null,
      code_examples: codeFor(id),
      related_problems: [],
    };
  }),
);
export function topicState(t: Topic, progress: Record<string, string>) {
  if (progress[t.id] === "COMPLETED") return "COMPLETED";
  if (!t.prerequisites.every((p) => progress[p] === "COMPLETED"))
    return "LOCKED";
  return progress[t.id] === "IN_PROGRESS" ? "IN_PROGRESS" : "AVAILABLE";
}
export function validateGraph(items: Pick<Topic, "id" | "prerequisites">[]) {
  const map = new Map(items.map((t) => [t.id, t])),
    done = new Set<string>(),
    active = new Set<string>();
  function visit(id: string): boolean {
    if (active.has(id) || !map.has(id)) return false;
    if (done.has(id)) return true;
    active.add(id);
    for (const p of map.get(id)!.prerequisites) if (!visit(p)) return false;
    active.delete(id);
    done.add(id);
    return true;
  }
  return map.size === items.length && items.every((t) => visit(t.id));
}
