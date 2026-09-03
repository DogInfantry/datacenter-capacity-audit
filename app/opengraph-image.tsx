import { ImageResponse } from "next/og";
import { prospectus } from "@/lib/data";
import { SITE } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "One estate, three capacity figures: 188.04 MW built, 131.88 MW installed, 113.67 MW operational";

/**
 * The card a shared link renders as.
 *
 * It draws the one thing worth knowing before a reader clicks: three figures
 * for one estate on one date, descending. The numbers come from the same file
 * the site renders from, so the card cannot disagree with the page.
 */
export default async function Image() {
  const rungs = prospectus.capacity.rungs;
  const widest = Math.max(...rungs.map((r) => r.mw));

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f1419",
          color: "#f2f4f6",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, color: "#7c95c4", letterSpacing: 2 }}>
            INDIA. DATA CENTRES AND AI INFRASTRUCTURE
          </div>
          <div style={{ fontSize: 58, marginTop: 18, lineHeight: 1.1 }}>
            One estate. Three capacity figures.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rungs.map((r) => (
            <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ fontSize: 26, width: 190, color: "#9fb0c4" }}>{r.name}</div>
              <div
                style={{
                  height: 34,
                  width: (r.mw / widest) * 620,
                  background: r.name === "Operational" ? "#e05c5c" : "#5b8dd9",
                  borderRadius: 3,
                }}
              />
              <div style={{ fontSize: 30 }}>{`${r.mw} MW`}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 24, color: "#9fb0c4" }}>
          {`${SITE.name}. Announced capacity and delivered capacity, kept in separate columns.`}
        </div>
      </div>
    ),
    size,
  );
}
