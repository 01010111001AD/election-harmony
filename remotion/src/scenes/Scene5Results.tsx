import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

const ROWS = [
  { name: "Adaeze Okonkwo", color: "#A65A3C", start: 0.18, end: 0.41 },
  { name: "Marcus Lindqvist", color: "#3C5A7A", start: 0.22, end: 0.36 },
  { name: "Priya Raghunathan", color: "#6B4A8A", start: 0.14, end: 0.23 },
];

export const Scene5Results = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [10, 130], [0, 1], { extrapolateRight: "clamp" });
  const headerIn = spring({ frame, fps, config: { damping: 200 } });
  const totalVotes = Math.floor(interpolate(t, [0, 1], [0, 1284 * 0.94]));

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 60, left: 80, fontFamily: fonts.sans, color: colors.gold, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase" }}>
        Step 04 · Live tally
      </div>

      <div
        style={{
          width: 1280,
          background: colors.parchment,
          borderRadius: 4,
          padding: "50px 70px",
          boxShadow: `0 60px 120px rgba(0,0,0,0.55), 0 0 0 1px ${colors.gold}`,
          opacity: headerIn,
          transform: `translateY(${(1 - headerIn) * 30}px)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${colors.gold}`, paddingBottom: 22, marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: fonts.sans, color: colors.gold, fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase" }}>Results · Live</div>
            <div style={{ fontFamily: fonts.serif, color: colors.navy, fontSize: 40, fontWeight: 600, marginTop: 4 }}>Board of Directors — 2026</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: fonts.serif, color: colors.navy, fontSize: 48, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{totalVotes.toLocaleString()}</div>
            <div style={{ fontFamily: fonts.sans, color: "rgba(11,27,58,0.6)", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              ballots received · of 1,284
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {ROWS.map((r, i) => {
            const appear = spring({ frame: frame - 20 - i * 10, fps, config: { damping: 200 } });
            const pct = interpolate(t, [0, 1], [r.start * 0.2, r.end]);
            const isLead = i === 0;
            return (
              <div key={r.name} style={{ opacity: appear, transform: `translateY(${(1 - appear) * 16}px)` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: r.color, color: colors.parchment, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.serif, fontWeight: 600, fontSize: 15 }}>
                      {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div style={{ fontFamily: fonts.serif, fontSize: 28, fontWeight: 600, color: colors.navy }}>{r.name}</div>
                    {isLead && t > 0.7 && (
                      <span style={{ fontFamily: fonts.sans, fontSize: 11, letterSpacing: "0.22em", color: colors.gold, textTransform: "uppercase", border: `1px solid ${colors.gold}`, padding: "3px 10px", borderRadius: 2, marginLeft: 8, opacity: interpolate(t, [0.7, 0.85], [0, 1]) }}>
                        Projected
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: fonts.serif, fontVariantNumeric: "tabular-nums", fontSize: 32, fontWeight: 700, color: colors.navy }}>{(pct * 100).toFixed(1)}%</div>
                </div>
                <div style={{ height: 14, background: "rgba(11,27,58,0.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct * 100}%`, background: isLead ? `linear-gradient(90deg, ${r.color}, ${colors.gold})` : r.color, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 36, display: "flex", gap: 24, fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.55)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span>● Realtime feed</span>
          <span>· Cryptographically sealed</span>
          <span>· Audit log immutable</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
