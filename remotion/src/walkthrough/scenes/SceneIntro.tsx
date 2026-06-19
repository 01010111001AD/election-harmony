import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { PersistentBackground } from "../PersistentBackground";

export const SceneIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowIn = interpolate(frame, [4, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleIn = spring({ frame: frame - 12, fps, config: { damping: 200, stiffness: 70 } });
  const subtitleIn = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
  const sealO = interpolate(frame, [20, 55], [0, 0.12], { extrapolateRight: "clamp" });
  const sealRot = interpolate(frame, [0, 162], [-8, 8]);

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* watermark seal */}
        <div
          style={{
            position: "absolute",
            width: 540,
            height: 540,
            borderRadius: "50%",
            border: `2px solid ${colors.gold}`,
            opacity: sealO,
            transform: `rotate(${sealRot}deg)`,
          }}
        >
          <div style={{ position: "absolute", inset: 24, borderRadius: "50%", border: `1px solid ${colors.gold}` }} />
          <div style={{ position: "absolute", inset: 60, borderRadius: "50%", border: `1px dashed ${colors.gold}` }} />
        </div>

        <div style={{ textAlign: "center", color: colors.parchment, maxWidth: 1100 }}>
          <div
            style={{
              fontFamily: fonts.sans,
              color: colors.gold,
              letterSpacing: "0.42em",
              fontSize: 18,
              fontWeight: 600,
              opacity: eyebrowIn,
              textTransform: "uppercase",
            }}
          >
            ElectaCore · Est. 2026
          </div>
          <h1
            style={{
              fontFamily: fonts.serif,
              fontWeight: 600,
              fontSize: 96,
              lineHeight: 1.02,
              margin: "28px 0 0",
              opacity: titleIn,
              letterSpacing: "-0.01em",
            }}
          >
            ElectaCore
          </h1>
          <p
            style={{
              fontFamily: fonts.serif,
              fontStyle: "italic",
              color: colors.goldBright,
              fontSize: 42,
              marginTop: 12,
              opacity: titleIn,
            }}
          >
            Private Elections, Engineered for Trust.
          </p>
          <p
            style={{
              fontFamily: fonts.sans,
              color: "rgba(244,239,228,0.75)",
              fontSize: 20,
              marginTop: 32,
              opacity: subtitleIn,
            }}
          >
            Boards · Unions · Cooperatives · Academic Bodies
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
