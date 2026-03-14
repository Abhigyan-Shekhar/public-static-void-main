export function BrandLogo({
  variant = "dark",
  compact = false,
  size = "md",
}: {
  variant?: "dark" | "light";
  compact?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const sizing = {
    xs: {
      wrap: "rounded-[12px] px-2.5 py-1.5",
      art: "w-[132px]",
    },
    sm: {
      wrap: "rounded-[14px] px-3 py-2",
      art: "w-[162px]",
    },
    md: {
      wrap: "rounded-[16px] px-3.5 py-2.5",
      art: "w-[194px]",
    },
    lg: {
      wrap: "rounded-[18px] px-4 py-3",
      art: "w-[236px]",
    },
  }[size];

  const darkSurface = "bg-[#1f2d3d] border border-white/10 shadow-sm";
  const lightSurface = "bg-white border border-slate-200 shadow-sm";
  const surfaceClass = variant === "light" ? "bg-white/8 backdrop-blur-sm" : lightSurface;
  const bgClass = compact ? surfaceClass : variant === "light" ? darkSurface : lightSurface;

  const beyondColor = variant === "light" ? "#f8fafc" : "#f8fafc";
  const bordersColor = "#dfc29c";
  const subtext = variant === "light" ? "rgba(255,255,255,0.72)" : "#64748b";

  return (
    <div className={`inline-flex items-center justify-center ${bgClass} ${sizing.wrap}`}>
      <svg
        viewBox="0 0 260 72"
        className={sizing.art}
        role="img"
        aria-label="Beyond Borders"
      >
        <text
          x="118"
          y="42"
          textAnchor="end"
          fill={beyondColor}
          fontSize="22"
          fontWeight="500"
          letterSpacing="-0.6"
        >
          Beyond
        </text>
        <text
          x="122"
          y="42"
          textAnchor="start"
          fill={bordersColor}
          fontSize="22"
          fontWeight="500"
          letterSpacing="-0.6"
        >
          Borders
        </text>

        {!compact && (
          <text
            x="130"
            y="62"
            textAnchor="middle"
            fill={subtext}
            fontSize="6.5"
            fontWeight="600"
            letterSpacing="2.1"
            style={{ textTransform: "uppercase" }}
          >
            Humanitarian Identity Platform
          </text>
        )}
      </svg>
    </div>
  );
}
