import "./fonts";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { colors } from "./theme";
import { Scene1Title } from "./scenes/Scene1Title";
import { Scene2Create } from "./scenes/Scene2Create";
import { Scene3Ballot } from "./scenes/Scene3Ballot";
import { Scene4Cast } from "./scenes/Scene4Cast";
import { Scene5Results } from "./scenes/Scene5Results";
import { Scene6Outro } from "./scenes/Scene6Outro";

const PersistentBackdrop = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const drift = Math.sin(frame * 0.005) * 30;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + drift}% ${20 + drift / 2}%, ${colors.navySoft} 0%, ${colors.navy} 45%, ${colors.navyDeep} 100%)`,
      }}
    >
      {/* faint grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,162,74,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,74,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: interpolate(t, [0, 1], [0.35, 0.6]),
        }}
      />
      {/* gold orb */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          right: -200 + Math.cos(frame * 0.008) * 40,
          top: -200 + Math.sin(frame * 0.006) * 40,
          background: `radial-gradient(circle, rgba(201,162,74,0.18), transparent 60%)`,
          filter: "blur(30px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.navyDeep, fontFamily: "Inter" }}>
      <PersistentBackdrop />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene1Title />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2Create />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 22 })} />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene3Ballot />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene4Cast />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: 22 })} />
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene5Results />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene6Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
