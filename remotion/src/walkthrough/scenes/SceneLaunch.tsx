import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { PersistentBackground } from "../PersistentBackground";
import { SectionLabel, Appear } from "../components/VisualHelpers";
import { MockCard } from "../components/MockCard";

export const SceneLaunch = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const toggleIn = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const pulse = spring({ frame: frame - 120, fps, config: { damping: 10, stiffness: 120 } });
  const emailIn = spring({ frame: frame - 200, fps, config: { damping: 200, stiffness: 70 } });

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <SectionLabel step={4} label="Launch" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
          <div style={{ width: 400, color: colors.parchment }}>
            <Appear delay={20}>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 44, fontWeight: 600, marginBottom: 16 }}>Open the election</h2>
            </Appear>
            <Appear delay={40}>
              <p style={{ fontFamily: fonts.sans, fontSize: 17, lineHeight: 1.55, color: "rgba(244,239,228,0.85)" }}>
                One status change sends secure invitations with unique tokens to every enrolled voter.
              </p>
            </Appear>
          </div>

          <div style={{ position: "relative", width: 520, height: 400 }}>
            {/* Status toggle */}
            <div style={{ position: "absolute", top: 0, left: 0, opacity: toggleIn, transform: `translateY(${(1 - toggleIn) * 30}px)` }}>
              <MockCard width={480} title="Election status" subtitle="Ready to launch">
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontFamily: fonts.sans, fontSize: 14, color: "rgba(11,27,58,0.6)" }}>Draft</div>
                  <div style={{ width: 64, height: 32, background: colors.emerald, borderRadius: 16, position: "relative" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: colors.parchment, position: "absolute", right: 3, top: 3 }} />
                  </div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.emerald, fontWeight: 600 }}>Open</div>
                </div>
              </MockCard>
            </div>

            {/* Ripple / broadcast */}
            <div style={{ position: "absolute", top: 160, left: 50, opacity: pulse, transform: `scale(${1 + pulse * 0.3})` }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${colors.gold}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: `rgba(201,162,74,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.gold, fontSize: 24 }}>✉</div>
              </div>
            </div>

            {/* Email preview */}
            <div style={{ position: "absolute", top: 200, right: 0, opacity: emailIn, transform: `translateY(${(1 - emailIn) * 40}px)` }}>
              <MockCard width={440} title="Secure ballot invitation" subtitle="To: voter@institution.org">
                <div style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.navy, marginBottom: 10 }}>Your private voting token:</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 26, color: colors.navy, letterSpacing: "0.14em", fontWeight: 600, marginBottom: 12 }}>7A3F – B91E – 2C04</div>
                <div style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(11,27,58,0.6)" }}>Click the link to cast your ballot securely.</div>
              </MockCard>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
