import { ImageResponse } from "next/og";
export const alt = "DSAverse — Learn DSA Visually";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "#101116",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
      }}
    >
      <div style={{ color: "#b39aff", fontSize: 34, marginBottom: 25 }}>
        DSAverse
      </div>
      <div style={{ fontSize: 76, fontWeight: 700 }}>
        See it. Understand it.
      </div>
      <div style={{ fontSize: 32, color: "#a0a0b4", marginTop: 30 }}>
        Learn data structures and algorithms visually.
      </div>
    </div>,
    size,
  );
}
