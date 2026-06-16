import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

const CANDIDATES = [
  { name: "Adaeze Okonkwo", role: "Chairperson · Lagos Chapter", color: "#A65A3C" },
  { name: "Marcus Lindqvist", role: "Treasurer · Nordic Branch", color: "#3C5A7A" },
  { name: "Priya Raghunathan", role: "Secretary · Asia-Pacific", color: "#6B4A8A" },
];

const Avatar = ({ name, color, size = 64 }: { name: string; color: string; size?: number }) => {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: colors.parchment,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.serif,
        fontWeight: 600,
        fontSize: size * 0.42,
        flexShrink: 0,
        boxShadow: `0 0 0 3px ${colors.parchment}, 0 0 0 4px ${colors.gold}`,
      }}
    >
      {initials}
    </div>
  );
};

export const Scene3Ballot = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokenIn = spring({ frame, fps, config: { damping: 200 } });
  const tokenOut = interpolate(frame, [55, 75], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ballotIn = spring({ frame: frame - 60, fps, config: { damping: 200, stiffness: 70 } });
  const selectedIdx = frame > 130 ? 1 : -1;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 60, left: 80, fontFamily: fonts.sans, color: colors.gold, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase" }}>
        Step 02 · Voter receives ballot
      </div>

      {/* Token slip */}
      <div
        style={{
          position: "absolute",
          opacity: tokenOut,
          transform: `translateY(${(1 - tokenIn) * 30 - (1 - tokenOut) * 60}px) scale(${0.95 + tokenIn * 0.05})`,
          background: colors.parchment,
          padding: "30px 50px",
          borderRadius: 4,
          border: `1px dashed ${colors.gold}`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: fonts.sans, fontSize: 11, letterSpacing: "0.32em", color: "rgba(11,27,58,0.6)", textTransform: "uppercase" }}>
          Your private voting token
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 46, color: colors.navy, marginTop: 14, letterSpacing: "0.18em", fontWeight: 600 }}>
          7A3F – B91E – 2C04
        </div>
      </div>

      {/* Ballot */}
      <div
        style={{
          width: 980,
          background: colors.parchment,
          borderRadius: 4,
          padding: 50,
          boxShadow: `0 60px 120px rgba(0,0,0,0.55), 0 0 0 1px ${colors.gold}`,
          opacity: ballotIn,
          transform: `translateY(${(1 - ballotIn) * 60}px)`,
        }}
      >
        <div style={{ borderBottom: `1px solid ${colors.gold}`, paddingBottom: 18, marginBottom: 28 }}>
          <div style={{ fontFamily: fonts.sans, color: colors.gold, fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase" }}>Official Ballot</div>
          <div style={{ fontFamily: fonts.serif, color: colors.navy, fontSize: 38, fontWeight: 600, marginTop: 4 }}>Board of Directors — 2026</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {CANDIDATES.map((c, i) => {
            const appear = spring({ frame: frame - 75 - i * 8, fps, config: { damping: 200 } });
            const selected = selectedIdx === i;
            return (
              <div
                key={c.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "18px 22px",
                  border: `1px solid ${selected ? colors.navy : "rgba(11,27,58,0.12)"}`,
                  background: selected ? "rgba(11,27,58,0.05)" : "transparent",
                  borderRadius: 6,
                  opacity: appear,
                  transform: `translateX(${(1 - appear) * 30}px)`,
                  transition: "none",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: `2px solid ${selected ? colors.navy : "rgba(11,27,58,0.35)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selected && <div style={{ width: 14, height: 14, borderRadius: "50%", background: colors.navy }} />}
                </div>
                <Avatar name={c.name} color={c.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: fonts.serif, fontSize: 26, color: colors.navy, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 14, color: "rgba(11,27,58,0.6)", marginTop: 2 }}>{c.role}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
