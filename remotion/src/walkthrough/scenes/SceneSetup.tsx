import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { PersistentBackground } from "../PersistentBackground";
import { SectionLabel, Appear } from "../components/VisualHelpers";
import { MockCard } from "../components/MockCard";

const Field = ({ label, value, delay, typed = false }: { label: string; value: string; delay: number; typed?: boolean }) => {
  const frame = useCurrentFrame();
  const chars = typed ? Math.floor(interpolate(frame - delay - 6, [0, 24], [0, value.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : value.length;
  return (
    <Appear delay={delay}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: fonts.sans, color: "rgba(11,27,58,0.55)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
        <div style={{ fontFamily: fonts.serif, color: colors.navy, fontSize: 24, fontWeight: 600, borderBottom: `1px solid rgba(11,27,58,0.15)`, paddingBottom: 8 }}>
          {value.slice(0, chars)}
          {typed && chars < value.length && <span style={{ opacity: (frame % 20) < 10 ? 1 : 0 }}>|</span>}
        </div>
      </div>
    </Appear>
  );
};

export const SceneSetup = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const stampIn = spring({ frame: frame - 520, fps, config: { damping: 12, stiffness: 180 } });

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <SectionLabel step={1} label="Setup & Configuration" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
          {/* Left: description */}
          <div style={{ width: 480, color: colors.parchment }}>
            <Appear delay={20}>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 48, fontWeight: 600, marginBottom: 20 }}>
                Configure the ballot
              </h2>
            </Appear>
            <Appear delay={40}>
              <p style={{ fontFamily: fonts.sans, fontSize: 18, lineHeight: 1.55, color: "rgba(244,239,228,0.85)" }}>
                Choose the voting method, set the schedule, and let the ballot inherit the organization's brand automatically.
              </p>
            </Appear>
          </div>

          {/* Right: admin form mockup */}
          <div style={{ transform: `translateY(${(1 - cardIn) * 40}px) scale(${0.94 + cardIn * 0.06})`, opacity: cardIn }}>
            <MockCard width={560} title="Board of Directors Election 2026" subtitle="New Election · Meridian Cooperative">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 32px" }}>
                <Field label="Election title" value="Board of Directors — 2026" delay={30} typed />
                <Field label="Method" value="Ranked Choice (IRV)" delay={50} />
                <Field label="Max selections" value="3" delay={70} />
                <Field label="Opens" value="Jun 18, 2026 · 09:00 UTC" delay={90} />
                <Field label="Closes" value="Jun 25, 2026 · 23:59 UTC" delay={110} />
              </div>

              {/* brand chips */}
              <Appear delay={130}>
                <div style={{ marginTop: 24, display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: colors.navy, color: colors.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.serif, fontWeight: 700 }}>M</div>
                  <span style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(11,27,58,0.7)" }}>Branding inherited from Meridian Cooperative</span>
                </div>
              </Appear>

              {/* Published stamp */}
              <div
                style={{
                  position: "absolute",
                  right: 40,
                  bottom: 30,
                  transform: `rotate(-8deg) scale(${stampIn})`,
                  opacity: stampIn,
                  border: `3px solid ${colors.emerald}`,
                  color: colors.emerald,
                  fontFamily: fonts.serif,
                  fontWeight: 700,
                  fontSize: 22,
                  padding: "8px 20px",
                  letterSpacing: "0.14em",
                }}
              >
                CONFIGURED
              </div>
            </MockCard>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
