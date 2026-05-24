import { useRef, useEffect, useState } from "react";

const MIN_W = 100,
  MIN_H = 100;

const Dots = ({
  onClose = () => {},
  onMinimize = () => {},
  onMaximize = () => {},
}) => {
  const [dotsHovered, setDotsHovered] = useState(false);

  return (
    <div
      style={styles.dots}
      onMouseEnter={() => setDotsHovered(true)}
      onMouseLeave={() => setDotsHovered(false)}
    >
      {[
        { bg: "#E24B4A", icon: "✖", iconColor: "#7a1515", onClick: onClose },
        { bg: "#EF9F27", icon: "", iconColor: "#7a5500", onClick: onMinimize },
        { bg: "#639922", icon: "", iconColor: "#1a4a00", onClick: onMaximize },
        // { bg: "#EF9F27", icon: "–", iconColor: "#7a5500", onClick: onMinimize },
        // { bg: "#639922", icon: "+", iconColor: "#1a4a00", onClick: onMaximize },
      ].map(({ bg, icon, iconColor, onClick }, i) => (
        <div
          key={i}
          onClick={onClick}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: bg,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: dotsHovered ? iconColor : "transparent",
            transition: "color 0.15s",
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};

export default function DraggableWindow({
  onClose,
  title = "",
  children,
}: {
  onClose?: () => void;
  title?: string;
  children?: any;
}) {
  const winRef = useRef<HTMLDivElement>(null);
  const mode = useRef<string | null>(null);
  const start = useRef<{
    x: number;
    y: number;
    l: number;
    t: number;
    w?: number;
    h?: number;
  } | null>(null);
  const [minimized, setMinimized] = useState(false);

  const onTitlebarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).dataset.action) return;
    const r = winRef.current?.getBoundingClientRect();
    const cb = winRef.current?.parentElement?.getBoundingClientRect();
    if (!r || !cb) return;

    mode.current = "drag";
    start.current = {
      x: e.clientX,
      y: e.clientY,
      l: r.left - cb.left,
      t: r.top - cb.top,
    };

    e.preventDefault();
  };

  const onHandleMouseDown = (dir: string) => (e: React.MouseEvent) => {
    const r = winRef.current?.getBoundingClientRect();
    const cb = winRef.current?.parentElement?.getBoundingClientRect();
    if (!r || !cb) return;

    mode.current = dir;
    start.current = {
      x: e.clientX,
      y: e.clientY,
      l: r.left - cb.left,
      t: r.top - cb.top,
      w: r.width,
      h: r.height,
    };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!mode.current) return;
      const el = winRef.current;

      if (!el?.parentElement) return;
      const cb = el.parentElement.getBoundingClientRect();

      if (!start.current) return;

      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      const { l, t, w, h } = start.current;

      if (mode.current === "drag") {
        el.style.left = `${Math.max(0, Math.min(l + dx, cb.width - el.offsetWidth))}px`;
        el.style.top = `${Math.max(0, Math.min(t + dy, cb.height - el.offsetHeight))}px`;
        return;
      }

      if (l == null || t == null || w == null || h == null) return;

      let nl = l,
        nt = t,
        nw = w,
        nh = h;
      if (mode.current.includes("e")) nw = Math.max(MIN_W, w + dx);
      if (mode.current.includes("s")) nh = Math.max(MIN_H, h + dy);
      if (mode.current.includes("w")) {
        nw = Math.max(MIN_W, w - dx);
        if (nw > MIN_W) nl = l + dx;
      }
      if (mode.current.includes("n")) {
        nh = Math.max(MIN_H, h - dy);
        if (nh > MIN_H) nt = t + dy;
      }

      el.style.left = `${nl}px`;
      el.style.top = `${nt}px`;
      el.style.width = `${nw}px`;
      el.style.height = `${nh}px`;
    };

    const onMouseUp = () => {
      mode.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handle = (dir: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw") => (
    <div onMouseDown={onHandleMouseDown(dir)} style={handleStyle(dir)} />
  );

  return (
    <div ref={winRef} style={styles.window}>
      <div onMouseDown={onTitlebarMouseDown} style={styles.titlebar}>
        {/* <div style={styles.dots}>
          <div
            onClick={() => onClose()}
            style={{ ...styles.dot, background: "#E24B4A" }}
          />
          <div
            onClick={() => {
              // setMinimized((m) => !m)
            }}
            style={{ ...styles.dot, background: "#EF9F27" }}
          />
          <div style={{ ...styles.dot, background: "#639922" }} />
        </div> */}
        <Dots onClose={onClose} />
        {/* dots, title */}
      </div>
      {!minimized && <div style={styles.body}>{children}</div>}
      {handle("n")} {handle("s")} {handle("e")} {handle("w")}
      {handle("ne")} {handle("nw")} {handle("se")} {handle("sw")}
    </div>
  );
}

const handleStyle = (
  dir: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw",
) => ({
  position: "absolute" as const,
  ...(dir.includes("n") ? { top: -4, height: 8 } : {}),
  ...(dir.includes("s") ? { bottom: -4, height: 8 } : {}),
  ...(dir.includes("e") ? { right: -4, width: 8 } : {}),
  ...(dir.includes("w") ? { left: -4, width: 8 } : {}),
  ...(dir.length === 1 && (dir === "n" || dir === "s")
    ? { left: 10, width: "calc(100% - 20px)" }
    : {}),
  ...(dir.length === 1 && (dir === "e" || dir === "w")
    ? { top: 10, height: "calc(100% - 20px)" }
    : {}),
  ...(dir.length === 2 ? { width: 14, height: 14 } : {}),
  cursor: `${dir}-resize`,
  zIndex: 10,
});

const styles = {
  window: {
    position: "absolute" as const,
    left: 60,
    top: 60,
    height: 400,
    width: 350,
    minWidth: 280,
    background: "#1e1e1e",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    userSelect: "none" as const,
    overflow: "hidden",
  },
  titlebar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "#2a2a2a",
    borderBottom: "0.5px solid rgba(255,255,255,0.08)",
    cursor: "cursor",
  },
  dots: {
    display: "flex",
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 500,
    color: "#999",
  },
  minimizeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: "#666",
    padding: "0 4px",
    lineHeight: 1,
  },
  body: {
    padding: 16,
    color: "#ccc",
    fontSize: 14,
    lineHeight: 1.6,
  },
};
