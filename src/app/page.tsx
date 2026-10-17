import Link from "next/link";
import { Logo } from "@/components/shell";
export default function Home() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Logo />
        <Link className="button outline" href="/dashboard">
          Enter workspace →
        </Link>
      </nav>
      <section className="landing-hero">
        <span className="pill accent">A clearer way to learn algorithms</span>
        <h1>
          Don’t just memorize it.
          <br />
          <span className="purple">See it. Understand it.</span>
        </h1>
        <p>
          Turn abstract algorithms into moments of clarity. Explore interactive
          visualizations, follow a connected learning path, and practice at your
          own pace.
        </p>
        <div className="row wrap" style={{ justifyContent: "center" }}>
          <Link href="/dashboard" className="button primary">
            Start learning for free →
          </Link>
          <Link href="/visualizer/binary-search" className="button outline">
            Try a visualization
          </Link>
        </div>
        <div className="landing-demo card pad">
          <div className="between">
            <span>Binary search · find 8</span>
            <span className="pill success">O(log n)</span>
          </div>
          <div className="cells" style={{ margin: "45px 0" }}>
            {[1, 3, 4, 6, 8, 12, 15].map((v, i) => (
              <div className={`cell ${v === 8 ? "active" : ""}`} key={v}>
                <span>{v}</span>
                <small>{i}</small>
              </div>
            ))}
          </div>
          <p>Halve the search space. Find the insight.</p>
        </div>
      </section>
      <div className="tiles">
        <div className="card pad">
          <h2>102 connected concepts</h2>
          <p>
            Follow prerequisites from your first variable to advanced
            algorithms.
          </p>
        </div>
        <div className="card pad">
          <h2>34 interactive labs</h2>
          <p>Play, pause, and inspect how the state changes at each step.</p>
        </div>
        <div className="card pad">
          <h2>172 practice problems</h2>
          <p>Keep notes, track attempts, and revisit what matters.</p>
        </div>
      </div>
    </div>
  );
}
