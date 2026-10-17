"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { topics, topicState } from "@/data/curriculum";
import { useProgress } from "./progress-provider";
export default function RoadmapGraph() {
  const { state } = useProgress(),
    router = useRouter();
  const nodes = useMemo(() => {
    const counts: Record<number, number> = {};
    return topics.map((t) => {
      const row = counts[t.level] ?? 0;
      counts[t.level] = row + 1;
      const status = topicState(t, state.topics);
      return {
        id: t.id,
        position: { x: t.level * 270, y: row * 95 },
        data: {
          label: `${status === "COMPLETED" ? "✓ " : status === "LOCKED" ? "○ " : ""}${t.title}`,
        },
        style: {
          background: status === "COMPLETED" ? "#19392e" : "#22232c",
          color: "#eeeaf6",
          border: `1px solid ${status === "AVAILABLE" ? "#a78bfa" : "#484352"}`,
          borderRadius: 10,
          width: 210,
          fontSize: 12,
          padding: 13,
        },
        ariaLabel: `${t.title}, ${status.toLowerCase()}`,
      };
    });
  }, [state.topics]);
  const edges = useMemo(
    () =>
      topics.flatMap((t) =>
        t.prerequisites.map((p) => ({
          id: `${p}-${t.id}`,
          source: p,
          target: t.id,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#82749f" },
          style: { stroke: "#82749f" },
        })),
      ),
    [],
  );
  return (
    <div className="flow" aria-label="Interactive prerequisite graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, node) => router.push(`/learn/${node.id}`)}
        fitView
        minZoom={0.15}
        colorMode={state.preferences.theme}
      >
        <Background />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeColor="#8f70d7" />
      </ReactFlow>
    </div>
  );
}
