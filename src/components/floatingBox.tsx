export default function ({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
      }}
    >
      {children}
    </div>
  );
}
