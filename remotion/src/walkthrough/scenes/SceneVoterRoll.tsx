import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { PersistentBackground } from "../PersistentBackground";
import { SectionLabel, Appear } from "../components/VisualHelpers";
import { MockCard } from "../components/MockCard";

export const SceneVoterRoll = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Three beats inside the scene: CSV (0-11s), Directory (11-22s), API (22-28s), Review (28-32.8s)
  const beat1 = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const beat2 = spring({ frame: frame - 350, fps, config: { damping: 200 } });
  const beat3 = spring({ frame: frame - 680, fps, config: { damping: 200 } });
  const reviewIn = spring({ frame: frame - 860, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <SectionLabel step={3} label="Voter Roll Creation" />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
          {/* Left description */}
          <div style={{ width: 380, color: colors.parchment, marginTop: 40 }}>
            <Appear delay={20}>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 42, fontWeight: 600, marginBottom: 16 }}>Build the voter roll</h2>
            </Appear>
            <Appear delay={40}>
              <p style={{ fontFamily: fonts.sans, fontSize: 16, lineHeight: 1.55, color: "rgba(244,239,228,0.85)" }}>
                Upload spreadsheets, enroll from the member directory, or sync via API. Every voter receives a unique token.
              </p>
            </Appear>
          </div>

          {/* Right stack of method cards */}
          <div style={{ position: "relative", width: 620, height: 560 }}>
            {/* CSV Upload */}
            <div style={{ position: "absolute", top: 0, left: 0, opacity: beat1, transform: `translateY(${(1 - beat1) * 30}px)` }}>
              <MockCard width={600} title="Upload voter list" subtitle="CSV / Excel">
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ width: 80, height: 90, border: `2px dashed ${colors.gold}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: colors.gold, fontFamily: fonts.sans, fontSize: 28 }}>📄</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(11,27,58,0.6)", marginBottom: 6 }}>Map columns:</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Email", "Name", "Tag"].map((l) => (
                        <span key={l} style={{ background: "rgba(11,27,58,0.08)", padding: "4px 10px", borderRadius: 4, fontFamily: fonts.sans, fontSize: 12, color: colors.navy }}>{l}</span>
                      ))}
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.emerald, marginTop: 10 }}>1,247 rows matched</div>
                  </div>
                </div>
              </MockCard>
            </div>

            {/* Directory */}
            <div style={{ position: "absolute", top: 150, left: 0, opacity: beat2, transform: `translateY(${(1 - beat2) * 30}px)` }}>
              <MockCard width={600} title="Enroll from directory" subtitle="Filter by tags">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["active members", "shareholders", "all members"].map((tag, i) => (
                    <span key={tag} style={{ background: i === 0 ? colors.navy : "rgba(11,27,58,0.08)", color: i === 0 ? colors.parchment : colors.navy, padding: "8px 14px", borderRadius: 20, fontFamily: fonts.sans, fontSize: 13 }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.emerald, marginTop: 14 }}>832 members selected</div>
              </MockCard>
            </div>

            {/* API */}
            <div style={{ position: "absolute", top: 300, left: 0, opacity: beat3, transform: `translateY(${(1 - beat3) * 30}px)` }}>
              <MockCard width={600} title="External database" subtitle="API sync">
                <div style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(11,27,58,0.6)", marginBottom: 8 }}>Paste API key</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 14, background: "rgba(11,27,58,0.06)", padding: 10, borderRadius: 4, letterSpacing: "0.05em" }}>••••••••••••••••••••••••</div>
                <div style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.emerald, marginTop: 10 }}>Sync verified · 1,204 eligible voters</div>
              </MockCard>
            </div>

            {/* Review badge */}
            <div style={{ position: "absolute", top: 460, left: 0, opacity: reviewIn, transform: `translateY(${(1 - reviewIn) * 20}px)` }}>
              <div style={{ background: colors.parchment, padding: "20px 28px", borderRadius: 4, boxShadow: `0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px ${colors.gold}` }}>
                <div style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.navy, fontWeight: 600 }}>Voter roll ready</div>
                <div style={{ fontFamily: fonts.sans, fontSize: 14, color: "rgba(11,27,58,0.7)", marginTop: 4 }}>1,284 enrolled · 0 duplicates · 3 late enrollees added</div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
