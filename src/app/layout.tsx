import type { Metadata } from "next";
import "./globals.css";
import { ProgressProvider } from "@/components/progress-provider";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: "DSAverse — Learn DSA Visually",
  description:
    "Learn algorithms through interactive visualizations, a connected roadmap, and deliberate practice.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProgressProvider>
          <Shell>{children}</Shell>
        </ProgressProvider>
      </body>
    </html>
  );
}
