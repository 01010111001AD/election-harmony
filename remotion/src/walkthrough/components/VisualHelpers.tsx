import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

export const SectionLabel = ({ step, label }: { step: number; label: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, 18], [-20, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        left: 60,
        fontFamily: fonts.sans,
        color: colors.gold,
        fontSize: 14,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        fontWeight: 600,
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      Step {String(step).padStart(2, "0")} · {label}
    </div>
  );
};

export const Appear = ({
  children,
  delay = 0,
  direction = "up",
  distance = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 80 } });
  const opacity = s;
  const dirs = { up: [0, -distance], down: [0, distance], left: [-distance, 0], right: [distance, 0] };
  const [dx, dy] = dirs[direction];
  const x = interpolate(s, [0, 1], [dx, 0]);
  const y = interpolate(s, [0, 1], [dy, 0]);

  return (
    <div style={{ opacity, transform: `translate(${x}px, ${y}px)` }}>
      {children}
    </div>
  );
};

export const LineReveal = ({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [delay, delay + 18], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div className={className} style={{ opacity, transform: `translateY(${y}px)` }}>
      {text}
    </div>
  );
};
