import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

const Field = ({ label, value, delay, typed = false }: { label: string; value: string; delay: number; typed?: boolean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const chars = typed ? Math.floor(interpolate(frame - delay - 6, [0, 30], [0, value.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : value.length;
  return (
    <div style={{ opacity: s, transform: `translateY(${(1 - s) * 12}px)` }}>
      <div style={{ fontFamily: fonts.sans, color: "rgba(11,27,58,0.55)", fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: fonts.serif, color: colors.navy, fontSize: 30, fontWeight: 600, borderBottom: `1px solid rgba(11,27,58,0.15)`, paddingBottom: 10 }}>
        {value.slice(0, chars)}
        {typed && chars < value.length && <span style={{ opacity: (frame % 20) < 10 ? 1 : 0 }}>|</span>}
      </div>
    </div>
  );
};

export const Scene2Create = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const stamp = spring({ frame: frame - 110, fps, config: { damping: 12, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 60, left: 80, fontFamily: fonts.sans, color: colors.gold, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", opacity: interpolate(frame, [0, 20], [0, 1]) }}>
        Step 01 · Configure ballot
      </div>

      <div
        style={{
          width: 1280,
          background: colors.parchment,
          borderRadius: 4,
          boxShadow: `0 60px 120px rgba(0,0,0,0.5), 0 0 0 1px ${colors.gold}`,
          padding: "60px 80px",
          transform: `translateY(${(1 - card) * 40}px) scale(${0.94 + card * 0.06})`,
          opacity: card,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${colors.gold}`, paddingBottom: 24, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: fonts.sans, color: colors.gold, fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase" }}>New Election</div>
            <div style={{ fontFamily: fonts.serif, color: colors.navy, fontSize: 42, fontWeight: 600, marginTop: 4 }}>Board of Directors · 2026</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: colors.navy, color: colors.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.serif, fontSize: 24, fontWeight: 700 }}>M</div>
            <div style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.navy }}>Meridian Cooperative</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px 64px" }}>
          <Field label="Election title" value="Board of Directors — 2026" delay={20} typed />
          <Field label="Method" value="Ranked Choice (IRV)" delay={40} />
          <Field label="Eligible voters" value="1,284 enrolled" delay={60} />
          <Field label="Opens" value="Jun 18, 2026 · 09:00 UTC" delay={80} />
        </div>

        {/* "Live" stamp */}
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: 40,
            transform: `rotate(-8deg) scale(${stamp})`,
            opacity: stamp,
            border: `3px solid ${colors.crimson}`,
            color: colors.crimson,
            fontFamily: fonts.serif,
            fontWeight: 700,
            fontSize: 28,
            padding: "10px 26px",
            letterSpacing: "0.18em",
          }}
        >
          PUBLISHED
        </div>
      </div>
    </AbsoluteFill>
  );
};
