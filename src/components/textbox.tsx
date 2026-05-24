import { useState, useRef, useEffect } from "react";

export default function ClickToEdit({
  label = "click to edit",
  save,
}: {
  label?: string;
  save?: (e: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef(null);

  useEffect(() => {
    setText(label);
  }, [label]);

  const onTextClick = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setEditing(false);
    if (save) save(e);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") inputRef.current?.blur();
  };

  return (
    <div style={{ position: "relative", background: "transparent" }}>
      {/* always rendered — holds the space */}
      <span
        ref={spanRef}
        onClick={onTextClick}
        style={{
          fontSize: 16,
          padding: "6px 12px",
          cursor: "text",
          visibility: editing ? "hidden" : "visible", // hides but keeps space
        }}
      >
        {text}
      </span>

      {/* overlays exactly on top — parent never shifts */}
      {editing && (
        <input
          ref={inputRef}
          value={text}
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => setText(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            fontSize: 16,
            padding: "6px 12px",
            fontFamily: "inherit",
            textAlign: "center",
            border: "1px solid #ccc",
            borderRadius: 6,
            outline: "none",
            boxSizing: "border-box",
            // background: "white",
          }}
        />
      )}
    </div>
  );
}
