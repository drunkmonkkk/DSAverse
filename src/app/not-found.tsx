import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <h1>This path hasn’t been mapped.</h1>
      <p>The page could not be found.</p>
      <Link className="button primary" href="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
