import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

export const Scene1Title = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eyebrow = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const ruleW = spring({ frame: frame - 10, fps, config: { damping: 200, stiffness: 60 } });
  const titleY = interpolate(frame, [18, 50], [40, 0], { extrapolateRight: "clamp" });
  const titleO = interpolate(frame, [18, 50], [0, 1], { extrapolateRight: "clamp" });
  const sealRot = interpolate(frame, [0, 130], [-8, 8]);
  const sealO = interpolate(frame, [30, 60], [0, 0.16], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* watermark seal */}
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          borderRadius: "50%",
          border: `2px solid ${colors.gold}`,
          opacity: sealO,
          transform: `rotate(${sealRot}deg)`,
        }}
      >
        <div style={{ position: "absolute", inset: 30, borderRadius: "50%", border: `1px solid ${colors.gold}` }} />
        <div style={{ position: "absolute", inset: 80, borderRadius: "50%", border: `1px dashed ${colors.gold}` }} />
      </div>

      <div style={{ textAlign: "center", color: colors.parchment, maxWidth: 1400 }}>
        <div
          style={{
            fontFamily: fonts.sans,
            color: colors.gold,
            letterSpacing: "0.42em",
            fontSize: 22,
            fontWeight: 600,
            opacity: eyebrow,
            textTransform: "uppercase",
          }}
        >
          ElectaCore · Est. 2026
        </div>
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
          <div style={{ height: 1, width: 380 * ruleW, background: colors.gold }} />
        </div>
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 600,
            fontSize: 132,
            lineHeight: 1.02,
            margin: "36px 0 0",
            transform: `translateY(${titleY}px)`,
            opacity: titleO,
            letterSpacing: "-0.01em",
          }}
        >
          Private Elections,
          <br />
          <span style={{ fontStyle: "italic", color: colors.goldBright }}>Engineered for Trust.</span>
        </h1>
        <p
          style={{
            fontFamily: fonts.sans,
            color: "rgba(244,239,228,0.75)",
            fontSize: 26,
            marginTop: 44,
            opacity: interpolate(frame, [55, 85], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Boards · Unions · Cooperatives · Academic Bodies
        </p>
      </div>
    </AbsoluteFill>
  );
};
