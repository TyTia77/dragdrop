import { useState } from "react";

export default function ({
  onClick,
  icon,
  label,
  color = "#333",
  disabled = false,
}: {
  onClick: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  label?: string;
  color?: string;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const iconOnly = icon && !label;

  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: iconOnly ? 48 : "auto",
        height: 48,
        padding: iconOnly ? 0 : "0 16px",
        borderRadius: iconOnly ? "50%" : 24,
        border: "none",
        opacity: disabled ? 0.4 : 1,
        background: color,
        color: "#fff",
        cursor: disabled ? "" : "pointer",
        boxShadow: hovered
          ? "0 6px 20px rgba(0,0,0,0.3)"
          : "0 4px 12px rgba(0,0,0,0.2)",
        fontSize: 14,
        transform: hovered ? "scale(1.05)" : "scale(1)",
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease",
        filter: hovered ? "brightness(1.15)" : "brightness(1)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
