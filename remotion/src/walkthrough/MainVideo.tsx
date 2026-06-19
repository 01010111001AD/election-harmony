import "../fonts";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SCENE_FRAMES, TOTAL_FRAMES } from "./narration";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneSetup } from "./scenes/SceneSetup";
import { SceneCandidates } from "./scenes/SceneCandidates";
import { SceneVoterRoll } from "./scenes/SceneVoterRoll";
import { SceneLaunch } from "./scenes/SceneLaunch";
import { SceneVoterExperience } from "./scenes/SceneVoterExperience";
import { SceneMonitoring } from "./scenes/SceneMonitoring";
import { SceneClose } from "./scenes/SceneClose";
import { SceneAudit } from "./scenes/SceneAudit";
import { SceneOutro } from "./scenes/SceneOutro";

const scenes = [
  SceneIntro,
  SceneSetup,
  SceneCandidates,
  SceneVoterRoll,
  SceneLaunch,
  SceneVoterExperience,
  SceneMonitoring,
  SceneClose,
  SceneAudit,
  SceneOutro,
];

export const WalkthroughVideo = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#070F23" }}>
      {scenes.map((Scene, i) => {
        const duration = SCENE_FRAMES[i].frames;
        const sequence = (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <Scene />
          </Sequence>
        );
        from += duration;
        return sequence;
      })}
      <Audio src={staticFile("walkthrough-narration.mp3")} />
    </AbsoluteFill>
  );
};
