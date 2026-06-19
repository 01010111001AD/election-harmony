import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { PersistentBackground } from "../PersistentBackground";
import { SectionLabel, Appear } from "../components/VisualHelpers";
import { MockCard } from "../components/MockCard";

const CANDIDATES = [
  { name: "Adaeze Okonkwo", role: "Chairperson · Lagos Chapter", color: "#A65A3C" },
  { name: "Marcus Lindqvist", role: "Treasurer · Nordic Branch", color: "#3C5A7A" },
  { name: "Priya Raghunathan", role: "Secretary · Asia-Pacific", color: "#6B4A8A" },
];

const Avatar = ({ name, color }: { name: string; color: string }) => {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: color,
        color: colors.parchment,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.serif,
        fontWeight: 600,
        fontSize: 20,
        flexShrink: 0,
        boxShadow: `0 0 0 2px ${colors.parchment}, 0 0 0 3px ${colors.gold}`,
      }}
    >
      {initials}
    </div>
  );
};

export const SceneCandidates = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <SectionLabel step={2} label="Candidate Onboarding" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
          <div style={{ width: 420, color: colors.parchment }}>
            <Appear delay={20}>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 44, fontWeight: 600, marginBottom: 16 }}>Add & order candidates</h2>
            </Appear>
            <Appear delay={40}>
              <p style={{ fontFamily: fonts.sans, fontSize: 17, lineHeight: 1.55, color: "rgba(244,239,228,0.85)" }}>
                Enter names, bios, and portraits. Drag the list into the exact order voters will see on the ballot.
              </p>
            </Appear>
          </div>

          <div>
            <MockCard width={540} title="Candidates" subtitle="Display order">
              {CANDIDATES.map((c, i) => {
                const inAnim = spring({ frame: frame - 60 - i * 12, fps, config: { damping: 200 } });
                return (
                  <div
                    key={c.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "14px 18px",
                      border: "1px solid rgba(11,27,58,0.12)",
                      borderRadius: 6,
                      marginBottom: 12,
                      opacity: inAnim,
                      transform: `translateX(${(1 - inAnim) * 30}px)`,
                    }}
                  >
                    <div style={{ fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.35)", width: 20 }}>⋮⋮</div>
                    <Avatar name={c.name} color={c.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.navy, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(11,27,58,0.6)", marginTop: 2 }}>{c.role}</div>
                    </div>
                    <div style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.gold, fontWeight: 600 }}>#{i + 1}</div>
                  </div>
                );
              })}
              <Appear delay={120}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", border: `1px dashed ${colors.gold}`, borderRadius: 6, color: "rgba(11,27,58,0.55)" }}>
                  <span style={{ fontSize: 20 }}>+</span>
                  <span style={{ fontFamily: fonts.sans, fontSize: 14 }}>Add another candidate</span>
                </div>
              </Appear>
            </MockCard>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
