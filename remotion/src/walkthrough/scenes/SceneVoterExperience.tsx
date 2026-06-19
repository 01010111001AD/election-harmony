import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { PersistentBackground } from "../PersistentBackground";
import { SectionLabel, Appear } from "../components/VisualHelpers";
import { MockCard } from "../components/MockCard";

const CANDIDATES = [
  { name: "Adaeze Okonkwo", role: "Chairperson", color: "#A65A3C" },
  { name: "Marcus Lindqvist", role: "Treasurer", color: "#3C5A7A" },
  { name: "Priya Raghunathan", role: "Secretary", color: "#6B4A8A" },
];

const Avatar = ({ name, color }: { name: string; color: string }) => {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: color,
        color: colors.parchment,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.serif,
        fontWeight: 600,
        fontSize: 17,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

export const SceneVoterExperience = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beats in frames: login 0-12s (360f), token 12-20s (600f), FPTP 20-28s, Approval 28-34s, Ranked 34-40s, YesNo 40-45s, Confirm 45-52.5s
  const loginIn = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const tokenTyped = Math.floor(interpolate(frame - 360, [0, 120], [0, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const fptpIn = spring({ frame: frame - 600, fps, config: { damping: 200 } });
  const approvalIn = spring({ frame: frame - 840, fps, config: { damping: 200 } });
  const rankedIn = spring({ frame: frame - 1020, fps, config: { damping: 200 } });
  const yesnoIn = spring({ frame: frame - 1200, fps, config: { damping: 200 } });
  const confirmIn = spring({ frame: frame - 1350, fps, config: { damping: 200, stiffness: 70 } });

  const renderBallot = () => {
    if (frame < 600) return null;
    if (frame < 840) {
      return (
        <div style={{ opacity: fptpIn, transform: `translateY(${(1 - fptpIn) * 30}px)` }}>
          <div style={{ fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.55)", marginBottom: 14, letterSpacing: "0.18em", textTransform: "uppercase" }}>First-Past-the-Post</div>
          {CANDIDATES.map((c, i) => {
            const selected = frame > 720 && i === 1;
            return (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, border: `1px solid ${selected ? colors.navy : "rgba(11,27,58,0.12)"}`, borderRadius: 6, marginBottom: 10, background: selected ? "rgba(11,27,58,0.05)" : "transparent" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected ? colors.navy : "rgba(11,27,58,0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.navy }} />}
                </div>
                <Avatar name={c.name} color={c.color} />
                <div style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.navy, fontWeight: 600 }}>{c.name}</div>
              </div>
            );
          })}
        </div>
      );
    }
    if (frame < 1020) {
      return (
        <div style={{ opacity: approvalIn, transform: `translateY(${(1 - approvalIn) * 30}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.55)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Approval Voting</div>
            <div style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.navy, fontWeight: 600 }}>Approve up to 2</div>
          </div>
          {CANDIDATES.map((c, i) => {
            const checked = (frame > 960 && i === 0) || (frame > 990 && i === 2);
            return (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, border: `1px solid ${checked ? colors.navy : "rgba(11,27,58,0.12)"}`, borderRadius: 6, marginBottom: 10, background: checked ? "rgba(11,27,58,0.05)" : "transparent" }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${checked ? colors.navy : "rgba(11,27,58,0.35)"}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {checked && <div style={{ width: 12, height: 12, background: colors.navy }} />}
                </div>
                <Avatar name={c.name} color={c.color} />
                <div style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.navy, fontWeight: 600 }}>{c.name}</div>
              </div>
            );
          })}
        </div>
      );
    }
    if (frame < 1200) {
      const ranking = frame > 1080 ? (frame > 1110 ? (frame > 1140 ? [0, 2, 1] : [0, 2]) : [0]) : [];
      return (
        <div style={{ opacity: rankedIn, transform: `translateY(${(1 - rankedIn) * 30}px)` }}>
          <div style={{ fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.55)", marginBottom: 14, letterSpacing: "0.18em", textTransform: "uppercase" }}>Ranked-Choice</div>
          {CANDIDATES.map((c, i) => {
            const rank = ranking.indexOf(i);
            return (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, border: `1px solid ${rank >= 0 ? colors.navy : "rgba(11,27,58,0.12)"}`, borderRadius: 6, marginBottom: 10, background: rank >= 0 ? "rgba(11,27,58,0.05)" : "transparent" }}>
                <Avatar name={c.name} color={c.color} />
                <div style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.navy, fontWeight: 600 }}>{c.name}</div>
                {rank >= 0 && <div style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: "50%", background: colors.gold, color: colors.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.sans, fontWeight: 700, fontSize: 14 }}>{rank + 1}</div>}
              </div>
            );
          })}
        </div>
      );
    }
    if (frame < 1350) {
      const selected = frame > 1260 ? "yes" : null;
      return (
        <div style={{ opacity: yesnoIn, transform: `translateY(${(1 - yesnoIn) * 30}px)` }}>
          <div style={{ fontFamily: fonts.sans, fontSize: 12, color: "rgba(11,27,58,0.55)", marginBottom: 14, letterSpacing: "0.18em", textTransform: "uppercase" }}>Yes / No Referendum</div>
          <div style={{ display: "flex", gap: 20 }}>
            {["yes", "no"].map((v) => (
              <div key={v} style={{ flex: 1, padding: 20, border: `2px solid ${selected === v ? colors.navy : "rgba(11,27,58,0.12)"}`, borderRadius: 6, textAlign: "center", background: selected === v ? "rgba(11,27,58,0.05)" : "transparent" }}>
                <div style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.navy, fontWeight: 600, textTransform: "capitalize" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div style={{ opacity: confirmIn, transform: `scale(${0.95 + confirmIn * 0.05})` }}>
        <div style={{ textAlign: "center", padding: 30 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: `rgba(31,107,74,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: colors.emerald, fontSize: 36 }}>🛡</div>
          <div style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.navy, fontWeight: 600 }}>Ballot received</div>
          <div style={{ fontFamily: fonts.sans, fontSize: 14, color: "rgba(11,27,58,0.7)", marginTop: 10, lineHeight: 1.5 }}>
            Securely recorded and audit-logged.<br />Encrypted in transit. No receipt — absolute secrecy.
          </div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <SectionLabel step={5} label="Voter Experience" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 56, alignItems: "center" }}>
          <div style={{ width: 380, color: colors.parchment }}>
            <Appear delay={20}>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 42, fontWeight: 600, marginBottom: 16 }}>Cast a secure vote</h2>
            </Appear>
            <Appear delay={40}>
              <p style={{ fontFamily: fonts.sans, fontSize: 16, lineHeight: 1.55, color: "rgba(244,239,228,0.85)" }}>
                Branded portal, flexible token entry, and a ballot interface matched to the voting method.
              </p>
            </Appear>
          </div>

          <div style={{ position: "relative", width: 520, height: 520 }}>
            {/* Login card */}
            <div style={{ position: "absolute", top: 0, left: 0, opacity: loginIn, transform: `translateY(${(1 - loginIn) * 30}px)`, zIndex: 10 }}>
              <MockCard width={480} title="Meridian Cooperative" subtitle="Official ballot portal">
                <div style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(11,27,58,0.6)", marginBottom: 8 }}>Enter your voting token</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 24, color: colors.navy, letterSpacing: "0.1em", fontWeight: 600, background: "rgba(11,27,58,0.06)", padding: 12, borderRadius: 4 }}>
                  {`${"7A3F-B91E-2C04".slice(0, tokenTyped)}`}
                  <span style={{ opacity: (frame % 20) < 10 ? 1 : 0 }}>|</span>
                </div>
              </MockCard>
            </div>

            {/* Ballot/confirm card */}
            <div style={{ position: "absolute", top: 50, left: 20, opacity: frame > 600 ? 1 : 0, transform: `translateY(${frame > 600 ? 0 : 20}px)`, transition: "none" }}>
              <MockCard width={480} title="Board of Directors — 2026" subtitle="Official ballot">
                {renderBallot()}
              </MockCard>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
