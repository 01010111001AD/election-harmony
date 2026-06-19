import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors } from "../theme";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const drift = Math.sin(frame * 0.003) * 20;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + drift}% ${20 + drift / 2}%, ${colors.navySoft} 0%, ${colors.navy} 45%, ${colors.navyDeep} 100%)`,
      }}
    >
      {/* faint grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,162,74,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,74,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: interpolate(t, [0, 1], [0.35, 0.6]),
        }}
      />
      {/* gold orb */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          right: -180 + Math.cos(frame * 0.005) * 30,
          top: -180 + Math.sin(frame * 0.004) * 30,
          background: `radial-gradient(circle, rgba(201,162,74,0.16), transparent 60%)`,
          filter: "blur(30px)",
        }}
      />
      {/* bottom left accent */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          left: -150,
          bottom: -150,
          background: `radial-gradient(circle, rgba(31,107,74,0.12), transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};
