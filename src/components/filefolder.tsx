import FloatingBox from "./floatingBox";
import { FolderIcon } from "./folder";
import { ShortcutIcon } from "./file";
import TextBox from "./textbox";
import type { fileType, folderType } from "../data/items";

export default function ({
  item,
  innerRef,
  save = () => {},
}: {
  item: fileType | folderType;
  innerRef?: (el: HTMLDivElement | null) => void;
  save?: (e: React.InputEvent) => void;
}) {
  return (
    <FloatingBox x={item.x} y={item.y}>
      <div
        ref={innerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        {item.type === "folder" ? <FolderIcon /> : <ShortcutIcon />}
        <TextBox label={item.label} save={save} />
      </div>
    </FloatingBox>
  );
}
