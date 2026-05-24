import { useState } from "react";

type actionType = {
  icon: any;
  label: string;
  onClick: (e: React.MouseEvent) => void;
};

export default function FloatingActions({
  actions,
}: {
  actions: actionType[];
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 12,
      }}
    >
      {/* sub actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
          overflow: "hidden",
          maxHeight: open ? 200 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.2s ease",
        }}
      >
        {actions.map(({ icon, label, onClick }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
            className="fab-row"
          >
            <span style={styles.label}>{label}</span>
            <button
              onClick={(e) => {
                onClick(e);
                setOpen((o) => !o);
              }}
              style={styles.child}
              aria-label={label}
            >
              <i className={`ti ${icon}`} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {/* main button */}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpen((o) => !o)}
        style={{
          ...styles.main,
          transform: hovered ? "scale(1.05)" : "scale(1)",
          transition:
            "transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease",
          filter: hovered ? "brightness(1.15)" : "brightness(1)",
          background: open ? "#0C447C" : "#185FA5",
        }}
        aria-label="open actions"
      >
        <i
          className="ti ti-plus"
          aria-hidden="true"
          style={{
            display: "block",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
            fontSize: 20,
          }}
        />
      </button>
    </div>
  );
}

const styles = {
  main: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  child: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#1e1e1e",
    border: "none",
    color: "#ccc",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    whiteSpace: "nowrap",
    background: "white",
    border: "0.5px solid #eee",
    padding: "3px 8px",
    borderRadius: 6,
    color: "#666",
  },
};
