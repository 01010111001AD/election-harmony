import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { PersistentBackground } from "../PersistentBackground";
import { SectionLabel, Appear } from "../components/VisualHelpers";
import { MockCard } from "../components/MockCard";

export const SceneMonitoring = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const data = [
    { label: "Adaeze Okonkwo", value: 384, color: "#A65A3C" },
    { label: "Marcus Lindqvist", value: 291, color: "#3C5A7A" },
    { label: "Priya Raghunathan", value: 217, color: "#6B4A8A" },
  ];
  const max = 500;

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <SectionLabel step={6} label="Monitoring & Live Results" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 56, alignItems: "center" }}>
          <div style={{ width: 380, color: colors.parchment }}>
            <Appear delay={20}>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 42, fontWeight: 600, marginBottom: 16 }}>Watch results live</h2>
            </Appear>
            <Appear delay={40}>
              <p style={{ fontFamily: fonts.sans, fontSize: 16, lineHeight: 1.55, color: "rgba(244,239,228,0.85)" }}>
                Real-time bar charts and turnout statistics. Individual choices stay hidden, but public results can be shared anonymously.
              </p>
            </Appear>
          </div>

          <div>
            <MockCard width={620} title="Live election dashboard" subtitle="Updates as ballots arrive">
              <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
                {[
                  { label: "Roll size", value: "1,284" },
                  { label: "Votes cast", value: "892" },
                  { label: "Turnout", value: "69.5%" },
                ].map((stat, i) => (
                  <Appear key={stat.label} delay={60 + i * 12}>
                    <div style={{ background: "rgba(11,27,58,0.06)", padding: "16px 24px", borderRadius: 4, minWidth: 110, textAlign: "center" }}>
                      <div style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.navy, fontWeight: 600 }}>{stat.value}</div>
                      <div style={{ fontFamily: fonts.sans, fontSize: 11, color: "rgba(11,27,58,0.55)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>{stat.label}</div>
                    </div>
                  </Appear>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {data.map((d, i) => {
                  const barIn = spring({ frame: frame - 150 - i * 12, fps, config: { damping: 200 } });
                  const width = interpolate(barIn, [0, 1], [0, (d.value / max) * 100]);
                  return (
                    <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.navy, width: 150, fontWeight: 600 }}>{d.label}</div>
                      <div style={{ flex: 1, height: 28, background: "rgba(11,27,58,0.08)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${width}%`, height: "100%", background: d.color, borderRadius: 4 }} />
                      </div>
                      <div style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.navy, width: 50, textAlign: "right", fontWeight: 600 }}>{d.value}</div>
                    </div>
                  );
                })}
              </div>

              <Appear delay={210}>
                <div style={{ marginTop: 20, fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.55)", textAlign: "center" }}>
                  Individual ballots are never displayed — only anonymized aggregates.
                </div>
              </Appear>
            </MockCard>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
