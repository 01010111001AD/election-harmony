import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

export const Scene6Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame, fps, config: { damping: 200 } });
  const lineW = interpolate(frame, [10, 50], [0, 480], { extrapolateRight: "clamp" });
  const tagIn = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: colors.parchment }}>
      <div style={{ opacity: logoIn, transform: `scale(${0.92 + logoIn * 0.08})`, textAlign: "center" }}>
        <div style={{ fontFamily: fonts.sans, color: colors.gold, fontSize: 16, letterSpacing: "0.5em", textTransform: "uppercase" }}>
          E · C
        </div>
        <h1 style={{ fontFamily: fonts.serif, fontSize: 156, fontWeight: 600, margin: "20px 0 0", letterSpacing: "-0.01em" }}>
          ElectaCore
        </h1>
      </div>
      <div style={{ height: 1, background: colors.gold, width: lineW, marginTop: 32 }} />
      <div style={{ marginTop: 28, fontFamily: fonts.serif, fontSize: 30, fontStyle: "italic", color: colors.goldBright, opacity: tagIn }}>
        Every vote, accounted for.
      </div>
      <div style={{ marginTop: 18, fontFamily: fonts.sans, fontSize: 16, color: "rgba(244,239,228,0.6)", letterSpacing: "0.22em", textTransform: "uppercase", opacity: tagIn }}>
        electacore · trusted private elections
      </div>
    </AbsoluteFill>
  );
};
