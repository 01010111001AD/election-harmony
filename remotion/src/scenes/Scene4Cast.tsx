import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

export const Scene4Cast = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ringDraw = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  const circ = 2 * Math.PI * 120;
  const check = interpolate(frame, [28, 60], [0, 1], { extrapolateRight: "clamp" });
  const textIn = spring({ frame: frame - 50, fps, config: { damping: 200 } });
  const hashIn = spring({ frame: frame - 80, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: colors.parchment }}>
      <div style={{ position: "absolute", top: 60, left: 80, fontFamily: fonts.sans, color: colors.gold, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase" }}>
        Step 03 · Ballot sealed
      </div>

      <svg width={300} height={300} style={{ overflow: "visible" }}>
        <circle cx={150} cy={150} r={120} stroke="rgba(201,162,74,0.2)" strokeWidth={3} fill="none" />
        <circle
          cx={150}
          cy={150}
          r={120}
          stroke={colors.gold}
          strokeWidth={4}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ringDraw)}
          transform="rotate(-90 150 150)"
          strokeLinecap="round"
        />
        <path
          d="M 100 152 L 138 188 L 204 118"
          stroke={colors.goldBright}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={170}
          strokeDashoffset={170 * (1 - check)}
        />
      </svg>

      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: 64,
          fontWeight: 600,
          marginTop: 48,
          opacity: textIn,
          transform: `translateY(${(1 - textIn) * 20}px)`,
        }}
      >
        Ballot encrypted &amp; cast
      </div>
      <div
        style={{
          fontFamily: fonts.sans,
          color: "rgba(244,239,228,0.65)",
          fontSize: 20,
          marginTop: 14,
          opacity: textIn,
        }}
      >
        End-to-end verifiable · zero linkage to voter identity
      </div>

      <div
        style={{
          marginTop: 56,
          padding: "16px 28px",
          border: `1px solid rgba(201,162,74,0.5)`,
          borderRadius: 4,
          fontFamily: fonts.mono,
          fontSize: 18,
          color: colors.goldBright,
          opacity: hashIn,
          letterSpacing: "0.08em",
        }}
      >
        receipt · 0xA17F · 4C92 · B038 · 7E11
      </div>
    </AbsoluteFill>
  );
};
