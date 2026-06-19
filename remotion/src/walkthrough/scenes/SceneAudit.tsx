import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { PersistentBackground } from "../PersistentBackground";
import { SectionLabel, Appear } from "../components/VisualHelpers";
import { MockCard } from "../components/MockCard";

export const SceneAudit = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entries = [
    { time: "2026-06-18 09:00:04 UTC", hash: "a7f3...9e2d", icon: "▪" },
    { time: "2026-06-18 09:12:17 UTC", hash: "b8c1...4a5f", icon: "▪" },
    { time: "2026-06-18 09:45:33 UTC", hash: "d2e9...7c1b", icon: "▪" },
    { time: "2026-06-18 10:03:58 UTC", hash: "e5a0...3f8e", icon: "▪" },
  ];

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <SectionLabel step={8} label="Audit & Transparency" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 56, alignItems: "center" }}>
          <div style={{ width: 380, color: colors.parchment }}>
            <Appear delay={20}>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 42, fontWeight: 600, marginBottom: 16 }}>Immutable audit trail</h2>
            </Appear>
            <Appear delay={40}>
              <p style={{ fontFamily: fonts.sans, fontSize: 16, lineHeight: 1.55, color: "rgba(244,239,228,0.85)" }}>
                Every ballot creates a cryptographic entry with a timestamp. No ballot can be altered after submission, and the tally always matches the log.
              </p>
            </Appear>
          </div>

          <div>
            <MockCard width={600} title="Audit log" subtitle="Cryptographically verified">
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.55)", marginBottom: 12, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                <span>Timestamp</span>
                <span>Entry hash</span>
              </div>
              {entries.map((e, i) => {
                const inAnim = spring({ frame: frame - 60 - i * 20, fps, config: { damping: 200 } });
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 4, background: i % 2 === 0 ? "rgba(11,27,58,0.04)" : "transparent", marginBottom: 8, opacity: inAnim, transform: `translateX(${(1 - inAnim) * 20}px)` }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.navy }}>{e.time}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.emerald }}>{e.hash}</div>
                  </div>
                );
              })}
              <Appear delay={150}>
                <div style={{ marginTop: 16, padding: 12, border: `1px dashed ${colors.gold}`, borderRadius: 4, textAlign: "center", fontFamily: fonts.sans, fontSize: 13, color: "rgba(11,27,58,0.7)" }}>
                  Export certified results report → PDF / CSV
                </div>
              </Appear>
            </MockCard>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
