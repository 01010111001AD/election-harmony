import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { PersistentBackground } from "../PersistentBackground";

export const SceneOutro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line1 = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const line2 = spring({ frame: frame - 120, fps, config: { damping: 200 } });
  const logo = spring({ frame: frame - 320, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: colors.parchment, padding: "0 200px" }}>
        <div style={{ maxWidth: 1100 }}>
          <div
            style={{
              fontFamily: fonts.serif,
              fontSize: 42,
              fontWeight: 600,
              lineHeight: 1.25,
              opacity: line1,
              transform: `translateY(${(1 - line1) * 20}px)`,
              marginBottom: 28,
            }}
          >
            From setup to certification, ElectaCore transforms election management into a secure, transparent, and scalable process.
          </div>
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: 22,
              lineHeight: 1.55,
              color: "rgba(244,239,228,0.85)",
              opacity: line2,
              transform: `translateY(${(1 - line2) * 20}px)`,
            }}
          >
            It replaces paper ballots and basic survey tools with a modern system that protects voter secrecy, gives administrators real-time confidence, and produces immutable, auditable records.
          </div>
          <div
            style={{
              marginTop: 48,
              fontFamily: fonts.serif,
              fontSize: 54,
              color: colors.goldBright,
              fontWeight: 600,
              fontStyle: "italic",
              opacity: logo,
              transform: `translateY(${(1 - logo) * 20}px)`,
            }}
          >
            ElectaCore — for elections that matter.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
