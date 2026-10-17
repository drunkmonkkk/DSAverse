import { Auth } from "@/components/auth";
import { notFound } from "next/navigation";
import Dashboard from "@/components/dashboard";
import {
  Roadmap,
  Lesson,
  Practice,
  ProblemDetail,
  Bookmarks,
} from "@/components/learning";
import { Visualizer, VisualizerLibrary } from "@/components/visualizer";
import { Analytics, Planner, Profile } from "@/components/personal";
import { topics } from "@/data/curriculum";
import { problems } from "@/data/problems";
import { algorithms } from "@/lib/algorithms";
export default async function Page({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  if (path.length === 1) {
    switch (path[0]) {
      case "dashboard":
        return <Dashboard />;
      case "roadmap":
        return <Roadmap />;
      case "practice":
        return <Practice />;
      case "visualizer":
        return <VisualizerLibrary />;
      case "analytics":
        return <Analytics />;
      case "planner":
        return <Planner />;
      case "bookmarks":
        return <Bookmarks />;
      case "profile":
        return <Profile />;
      case "auth":
        return <Auth />;
    }
  }
  if (path.length === 2) {
    const [section, slug] = path;
    if (
      section === "auth" &&
      ["login", "signup", "reset-password", "update-password"].includes(slug)
    )
      return (
        <Auth
          mode={
            slug as "login" | "signup" | "reset-password" | "update-password"
          }
        />
      );
    if (section === "learn" && topics.some((t) => t.slug === slug))
      return <Lesson slug={slug} />;
    if (section === "practice" && problems.some((p) => p.slug === slug))
      return <ProblemDetail slug={slug} />;
    if (section === "visualizer" && algorithms.some((a) => a.id === slug))
      return <Visualizer key={slug} id={slug} />;
  }
  notFound();
}
