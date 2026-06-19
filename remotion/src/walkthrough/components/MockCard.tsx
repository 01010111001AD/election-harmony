import { colors } from "../theme";

export const MockCard = ({
  children,
  width = 520,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  width?: number;
  title?: string;
  subtitle?: string;
}) => (
  <div
    style={{
      width,
      background: colors.parchment,
      borderRadius: 4,
      boxShadow: `0 40px 80px rgba(0,0,0,0.45), 0 0 0 1px ${colors.gold}`,
      padding: "36px 40px",
      color: colors.navy,
    }}
  >
    {(title || subtitle) && (
      <div style={{ borderBottom: `1px solid ${colors.gold}`, paddingBottom: 16, marginBottom: 24 }}>
        {title && (
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 600 }}>{title}</div>
        )}
        {subtitle && (
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(11,27,58,0.55)", marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
    )}
    {children}
  </div>
);
