import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { WalkthroughVideo } from "./walkthrough/MainVideo";
import { TOTAL_FRAMES, FPS } from "./walkthrough/narration";

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={1140}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="walkthrough"
      component={WalkthroughVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1280}
      height={720}


    />
  </>
);

