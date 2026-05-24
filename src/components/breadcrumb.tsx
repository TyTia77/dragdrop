import { useState } from "react";

type breadcrumbType = {
  label: string;
  onClick: () => void;
};

const BreadcrumbLink = ({ label, onClick }: breadcrumbType) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? "#fff" : "#888",
        background: hovered ? "rgba(255,255,255,0.08)" : "transparent",
        cursor: "pointer",
        padding: "2px 6px",
        borderRadius: 4,
        transition: "all 0.1s",
      }}
    >
      {label}
    </span>
  );
};

export const Breadcrumb = ({ paths = [] }: { paths: breadcrumbType[] }) => {
  return (
    <div style={styles.container}>
      {paths.map((item, i) => {
        const isLast = i === paths.length - 1;
        return (
          <div key={i} style={styles.item}>
            {isLast ? (
              <span
                style={isLast ? styles.active : styles.link}
                onClick={!isLast ? item.onClick : undefined}
              >
                {item.label}
              </span>
            ) : (
              <BreadcrumbLink label={item.label} onClick={item.onClick} />
            )}

            {!isLast && <span style={styles.separator}>/</span>}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 4,
    fontSize: 13,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  link: {
    color: "#888",
    cursor: "pointer",
    padding: "2px 4px",
    borderRadius: 4,
  },
  active: {
    color: "#fff",
    fontWeight: 500,
    padding: "2px 4px",
  },
  separator: {
    color: "#555",
    fontSize: 12,
  },
};
