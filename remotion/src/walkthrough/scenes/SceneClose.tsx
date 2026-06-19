import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { PersistentBackground } from "../PersistentBackground";
import { SectionLabel, Appear } from "../components/VisualHelpers";
import { MockCard } from "../components/MockCard";

export const SceneClose = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const statusIn = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const certifyIn = spring({ frame: frame - 240, fps, config: { damping: 200, stiffness: 70 } });

  const results = [
    { name: "Adaeze Okonkwo", count: 384, percent: 43.0 },
    { name: "Marcus Lindqvist", count: 291, percent: 32.6 },
    { name: "Priya Raghunathan", count: 217, percent: 24.3 },
  ];

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <SectionLabel step={7} label="Close & Certify" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 56, alignItems: "center" }}>
          <div style={{ width: 380, color: colors.parchment }}>
            <Appear delay={20}>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 42, fontWeight: 600, marginBottom: 16 }}>Certify the results</h2>
            </Appear>
            <Appear delay={40}>
              <p style={{ fontFamily: fonts.sans, fontSize: 16, lineHeight: 1.55, color: "rgba(244,239,228,0.85)" }}>
                Close voting, review, and certify. Results become immutable and permanently visible.
              </p>
            </Appear>
          </div>

          <div style={{ position: "relative", width: 520, height: 440 }}>
            <div style={{ position: "absolute", top: 0, left: 0, opacity: statusIn, transform: `translateY(${(1 - statusIn) * 30}px)` }}>
              <MockCard width={480} title="Election status" subtitle="Voting has closed">
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontFamily: fonts.sans, fontSize: 14, color: "rgba(11,27,58,0.6)" }}>Open</div>
                  <div style={{ width: 64, height: 32, background: "rgba(11,27,58,0.25)", borderRadius: 16, position: "relative" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: colors.parchment, position: "absolute", left: 3, top: 3 }} />
                  </div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.crimson, fontWeight: 600 }}>Closed</div>
                </div>
              </MockCard>
            </div>

            <div style={{ position: "absolute", top: 140, left: 0, opacity: certifyIn, transform: `translateY(${(1 - certifyIn) * 40}px)` }}>
              <MockCard width={480} title="Certified Results" subtitle="Board of Directors — 2026">
                {results.map((r, i) => (
                  <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < results.length - 1 ? "1px solid rgba(11,27,58,0.1)" : "none" }}>
                    <div>
                      <div style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.navy, fontWeight: 600 }}>{r.name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.navy, fontWeight: 600 }}>{r.count}</div>
                      <div style={{ fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.55)" }}>{r.percent}%</div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", fontFamily: fonts.sans, fontSize: 14, color: colors.emerald, fontWeight: 600 }}>
                  <span>Turnout: 69.5%</span>
                  <span>Winning margin: 10.4%</span>
                </div>
                <div style={{ marginTop: 12, textAlign: "center", fontFamily: fonts.sans, fontSize: 11, color: "rgba(11,27,58,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Immutable · Certified</div>
              </MockCard>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
