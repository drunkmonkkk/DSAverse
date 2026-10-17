"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Code2,
  LayoutDashboard,
  GitBranch,
  Play,
  ChartNoAxesCombined,
  CalendarDays,
  Bookmark,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Flame,
  Search,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useProgress } from "./progress-provider";
import { streaks } from "@/lib/progress";
import { Button } from "./ui/button";
export const nav = [
  { href: "/dashboard", title: "Overview", icon: LayoutDashboard },
  { href: "/roadmap", title: "Learning roadmap", icon: GitBranch },
  { href: "/visualizer", title: "Visualizers", icon: Play },
  { href: "/practice", title: "Practice sheet", icon: Code2 },
  { href: "/analytics", title: "Analytics", icon: ChartNoAxesCombined },
  { href: "/planner", title: "Study planner", icon: CalendarDays },
  { href: "/bookmarks", title: "Bookmarks", icon: Bookmark },
];
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="DSAverse home">
      <span className="logo-symbol">
        <Code2 size={20} />
      </span>
      <span>
        DSA<span className="purple">verse</span>
        <small>LEARN DSA VISUALLY</small>
      </span>
    </Link>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    { state, user, sync, update } = useProgress(),
    [open, setOpen] = useState(false),
    [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  if (path === "/" || path.startsWith("/auth"))
    return (
      <>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <main id="main">{children}</main>
      </>
    );
  const title =
    nav.find((n) => path.startsWith(n.href))?.title ??
    (path.startsWith("/learn") ? "Topic lesson" : "Profile & preferences");
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {open && (
        <button
          className="overlay"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`sidebar ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
        id="navigation"
        aria-label="Main navigation"
      >
        <Logo />
        <button
          className="collapse"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
        <div className="sidebar-label">WORKSPACE</div>
        <nav>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              title={n.title}
              aria-current={path.startsWith(n.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`nav-link ${path.startsWith(n.href) ? "active" : ""}`}
            >
              <n.icon />
              <span className="nav-label">{n.title}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-callout">
            <Sparkles size={17} className="purple" />
            <h3 style={{ marginTop: 8 }}>Small steps. Big breakthroughs.</h3>
            <p>Your next “aha!” moment is one lesson away.</p>
            <Link
              href="/planner"
              className="text-link"
              onClick={() => setOpen(false)}
            >
              Make a learning plan <ArrowUpRight size={13} />
            </Link>
          </div>
          <Link
            className="nav-link"
            href="/profile"
            onClick={() => setOpen(false)}
            title="Preferences"
          >
            <Settings />
            <span className="nav-label">Settings & preferences</span>
          </Link>
          <Link
            className="sidebar-user"
            href="/profile"
            onClick={() => setOpen(false)}
          >
            <div className="avatar">
              {state.preferences.name[0]?.toUpperCase() ?? "E"}
            </div>
            <div>
              <strong>{state.preferences.name}</strong>
              <small>
                {user ? "Cloud account" : "Local learner"} · Level{" "}
                {Math.floor(state.events.reduce((n, e) => n + e.xp, 0) / 250) +
                  1}
              </small>
            </div>
          </Link>
        </div>
      </aside>
      <div className={`shell ${collapsed ? "collapsed" : ""}`}>
        <header className="topbar">
          <div className="row">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-only"
              aria-label="Open navigation"
              aria-expanded={open}
              aria-controls="navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <div className="row crumb">
              <span className="desktop-crumb">Workspace</span>
              <ChevronRight className="desktop-crumb" size={12} />
              <strong>{title}</strong>
            </div>
          </div>
          <div className="row">
            <Link href="/roadmap" className="search-link">
              <Search size={14} />
              Explore topics
            </Link>
            <Link href="/analytics" className="top-streak">
              <Flame size={17} />
              {streaks(state.events, state.preferences.timezone).current}
              <span>day streak</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Switch to ${state.preferences.theme === "dark" ? "light" : "dark"} theme`}
              onClick={() =>
                update((s) => ({
                  ...s,
                  preferences: {
                    ...s.preferences,
                    theme: s.preferences.theme === "dark" ? "light" : "dark",
                  },
                }))
              }
            >
              {state.preferences.theme === "dark" ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
            </Button>
            <Link href="/profile" className="avatar" aria-label="Your profile">
              {state.preferences.name[0]?.toUpperCase() ?? "E"}
            </Link>
          </div>
        </header>
        <main id="main" className="content">
          {children}
          <footer className="footer">
            <span>
              <span className="welcome-dot" />
              {sync}
            </span>
            <span>Made for curious minds. One concept at a time.</span>
          </footer>
        </main>
      </div>
    </>
  );
}
