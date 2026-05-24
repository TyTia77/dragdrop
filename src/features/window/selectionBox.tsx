export default function ({
  innerRef,
}: {
  innerRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={innerRef}
      style={{
        position: "absolute",
        display: "none",
        border: "1px solid #4af",
        background: "rgba(64,170,255,0.1)",
        pointerEvents: "none", // so it doesn't interfere with hover targets
      }}
    ></div>
  );
}
