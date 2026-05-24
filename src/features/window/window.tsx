import { useEffect, useState, useRef } from "react";
import { useItems } from "../../context/context";

// import FloatingBox from "../../components/floatingBox";
// import { FolderIcon } from "./folder";
// import { ShortcutIcon } from "./file";
// import TextBox from "./textbox";
import FloatingActions from "../../components/floatingButton";
import Button from "../../components/button";
import { overlaps } from "./utils";
import type { itemType } from "../../data/items";
import FileFolderComponent from "../../components/filefolder";
import SelectionBox from "./selectionBox";
import WindowWrapper from "./windowWrapper";

const Window = ({
  index,
  items,
  bgcolor,
  // children,
}: {
  index: number;
  items: itemType;
  bgcolor?: string;
  // children?: React.ReactNode;
}) => {
  const [activewin, setactivewin] = useState<itemType>([]);
  const [window, setwindow] = useState<itemType>(items);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0, xo: 0, yo: 0 });
  const cachedRects = useRef<Record<string, DOMRect | undefined>>({});
  const compRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const currentSel = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const { add, updateItems, setItems, updatePropById, history } = useItems();

  useEffect(() => {
    setwindow(() => [...items]);
  }, [items]);

  const snapToGrid = () => {
    const ITEM_GAP = 20;

    containerRef?.current?.click();
    // console.log(cachedRects.current);

    const cached = Object.entries(cachedRects.current);

    // @ts-ignore
    const { top, bottom, left, right, width, height } =
      // @ts-ignore
      containerRef.current.getBoundingClientRect();

    const containerWidth = width;
    let x = 20;
    let y = 20;
    let rowHeight = 0;

    const newPos = [...window].map((w) => {
      // wrap to next line if item doesn't fit

      // const find = cached.find((f) => f[0] == w.id);
      const find = cached.find((f) => f[0] === String(w.id));

      if (!find || !find[1]) return w;

      if (x + find[1].width > containerWidth) {
        x = 20;
        y += rowHeight + ITEM_GAP;
        rowHeight = 0;
      }

      const newItem = { ...w, x, y };

      x += find[1].width + ITEM_GAP;
      rowHeight = Math.max(rowHeight, find[1].height);

      return newItem;
    });

    //save to context
    updateItems(index, newPos, "replace");
  };

  const handleDragDrop = ({
    e,
    dropfrom = null,
    dropto = index,
  }: {
    e: React.DragEvent<HTMLElement>;
    dropfrom?: number | null;
    dropto?: number;
  }) => {
    // cannot drop into itself
    if (dropto !== -1 && selectedIds.includes(String(dropto))) return;

    const items = e.dataTransfer.getData("datatransfer");
    const jsoned = JSON.parse(items);

    // @ts-ignore
    const { x, y, top, bottom, left, right, width, height } =
      containerRef.current?.getBoundingClientRect();

    //remove
    // jsoned.index jsoned.selected
    updateItems(dropfrom || jsoned.index, jsoned.notselected, "replace");

    //add
    // index jsoned.selected
    updateItems(
      dropto,
      jsoned.selected.map((x) => {
        return {
          ...x,
          x: Math.max(0, e.clientX - left - x.xoffset),
          y: Math.max(0, e.clientY - top - x.yoffset),
        };
      }),
    );
  };

  return (
    <div
      ref={containerRef}
      id={`panel${index}`}
      style={{
        height: "100%",
        width: "100%",
        transform: "translate(-16px, 0px)",
        backgroundColor: bgcolor || "transparent",
      }}
      onDragOver={(e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e: React.DragEvent<HTMLElement>) => {
        handleDragDrop({ e });
      }}
      onMouseMove={(e: React.MouseEvent) => {
        if (!isDragging.current) return;

        // @ts-ignore
        const { x, y, top, bottom, left, right, width, height } =
          containerRef.current?.getBoundingClientRect();

        const start = startPos.current;
        const x1 = Math.min(e.clientX, start.x);
        const y1 = Math.min(e.clientY, start.y);
        const x2 = Math.max(e.clientX, start.x);
        const y2 = Math.max(e.clientY, start.y);

        // needed for relative selection box
        const xx1 = Math.min(e.clientX - left, start.x - left);
        const yy1 = Math.min(e.clientY - top, start.y - top);
        const xx2 = Math.max(e.clientX - left, start.x - left);
        const yy2 = Math.max(e.clientY - top, start.y - top);

        // Update selection box
        const box = boxRef.current;
        if (box) {
          box.style.left = `${xx1}px`;
          box.style.top = `${yy1}px`;
          box.style.width = `${xx2 - xx1}px`;
          box.style.height = `${yy2 - yy1}px`;
        }

        // Store current selection bounds
        currentSel.current = { x1, y1, x2, y2 };

        // Check overlaps — no re-render
        // Object.entries(cachedRects.current).forEach(([id, rect]) => {
        //   const hit = overlaps(rect, currentSel.current);
        //   compRefs.current[id]?.classList.toggle("selected", hit);
        // });
        Object.entries(cachedRects.current)
          .filter((entry): entry is [string, DOMRect] => entry[1] !== undefined)
          .forEach(([id, rect]) => {
            const hit = overlaps(rect, currentSel.current);
            compRefs.current[id]?.classList.toggle("selected", hit);
          });
      }}
      onMouseDown={(e: React.MouseEvent) => {
        // setSelectedIds(() => []);

        // console.log("compref", compRefs.current, { selectedIds });

        if (compRefs.current) {
          cachedRects.current = Object.fromEntries(
            Object.entries(compRefs.current)
              .filter(([, el]) => el !== null) // ← guard here
              .map(([id, el]) => {
                compRefs.current[id]?.classList.toggle("selected", false);
                return [id, el?.getBoundingClientRect()];
              }),
          );
        }

        if (
          e.target instanceof HTMLElement &&
          e.target.id === `panel${index}`
        ) {
          isDragging.current = true;
          startPos.current = {
            x: e.clientX,
            y: e.clientY,
            xo: e.clientX - e.nativeEvent.offsetX,
            yo: e.clientY - e.nativeEvent.offsetY,
          };
          //   startPos.current = {
          //     x: e.clientX - (e.clientX - e.nativeEvent.offsetX),
          //     y: e.clientY - (e.clientY - e.nativeEvent.offsetY),
          //     xo: e.clientX - e.nativeEvent.offsetX,
          //     yo: e.clientY - e.nativeEvent.offsetY,
          //   };

          const box = boxRef.current;
          if (box) {
            box.style.left = `${e.clientX}px`;
            box.style.top = `${e.clientY}px`;
            box.style.width = "0px";
            box.style.height = "0px";
            box.style.display = "block";
          }
        }
      }}
      onMouseUp={(e: React.MouseEvent) => {
        if (!isDragging.current) return;

        isDragging.current = false;
        if (boxRef.current) boxRef.current.style.display = "none";

        // Commit to state — single render
        // const ids = Object.entries(cachedRects.current)
        //   .filter(([, rect]) => overlaps(rect, currentSel.current))
        //   .map(([id]) => id);
        const ids = Object.entries(cachedRects.current)
          .filter((entry): entry is [string, DOMRect] => entry[1] !== undefined)
          .filter(([, rect]) => overlaps(rect, currentSel.current))
          .map(([id]) => id);

        // reset selection box
        currentSel.current = { x1: 0, y1: 0, x2: 0, y2: 0 };

        setSelectedIds(ids);
      }}
    >
      <div
        style={{
          position: "fixed",
          bottom: index != -1 ? 100 : 24,
          left: index != -1 ? 24 : 54, // anchor to right
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start", // align children to the right
          gap: 11,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            onClick={snapToGrid}
            label={""}
            disabled={window.length == 0}
            icon={<i className="ti ti-grid-dots" style={{ fontSize: 20 }} />}
            color="#6366f1"
          ></Button>
        </div>
        {index == -1 && (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                onClick={() => {
                  history.back();
                }}
                label={""}
                disabled={history.pointer == 0}
                icon={
                  <i className="ti ti-arrow-back-up" style={{ fontSize: 20 }} />
                }
                color="#6b7280"
              ></Button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                onClick={() => {
                  history.forward();
                }}
                label={""}
                disabled={history.pointer + 1 == history.history.length}
                icon={
                  <i
                    className="ti ti-arrow-forward-up"
                    style={{ fontSize: 20 }}
                  />
                }
                color="#6b7280"
              ></Button>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: index != -1 ? 100 : 24,
          right: 24, // anchor to right
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end", // align children to the right
          gap: 11,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <FloatingActions
            actions={[
              {
                icon: "ti-file-plus",
                label: "new file",
                onClick: (e) => {
                  e.stopPropagation();
                  add(index);
                },
              },
              {
                icon: "ti-folder-plus",
                label: "new folder",
                onClick: (e) => {
                  e.stopPropagation();
                  add(index, "folder");
                },
              },
            ]}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              updateItems(
                index,
                window
                  .map((w) => ({
                    ...w,
                    selected: selectedIds.includes(String(w.id)),
                  }))
                  .filter(({ selected }) => !selected),
                "replace",
              );
            }}
            label={""}
            disabled={selectedIds.length == 0}
            icon={<i className="ti ti-trash" style={{ fontSize: 20 }} />}
            color="#E24B4A"
          ></Button>
        </div>
      </div>

      {window
        .filter(({ open }) => !open)
        .map((w) => {
          return (
            // <WindowWrapper
            //   key={w.id}
            //   index={index}
            //   window={w}
            //   windows={window}
            //   selectedIds={selectedIds}
            //   setSelectedIds={setSelectedIds}
            //   onDrop={handleDragDrop}
            //   setactivewin={setactivewin}
            //   containerRef={containerRef}
            //   compRefs={compRefs}
            //   cachedRects={cachedRects}
            // >
            <div
              draggable
              key={w.id}
              onDoubleClick={(e: React.MouseEvent) => {
                if (w.type == "folder") {
                  setSelectedIds([]);
                  setItems(updatePropById(w.id, { open: true }));
                }
              }}
              onDrop={(e: React.DragEvent<HTMLElement>) => {
                e.stopPropagation();
                if (w.type == "folder") {
                  handleDragDrop({ e, dropto: w.id });
                }
              }}
              onDragStart={(e: React.DragEvent<HTMLElement>) => {
                const windowlist = window.map((w) => ({
                  ...w,
                  selected: selectedIds.includes(String(w.id)),
                }));
                if (windowlist.filter((f) => f.selected).length) {
                  // @ts-ignore
                  const { x, y, top, bottom, left, right, width, height } =
                    // @ts-ignore
                    containerRef.current.getBoundingClientRect();
                  const xx = windowlist.map((w) => {
                    if (w.selected) {
                      return {
                        ...w,
                        xoffset: e.clientX - left - w.x,
                        yoffset: e.clientY - top - w.y,
                      };
                    }
                    return w;
                  });
                  const ff = xx.filter((f) => f.selected);
                  const notselected = xx.filter((f) => !f.selected);
                  setactivewin(ff);
                  e.dataTransfer.dropEffect = "move";
                  e.dataTransfer.setData(
                    "datatransfer",
                    JSON.stringify({ index, selected: ff, notselected }),
                  );
                  e.dataTransfer.setDragImage(
                    document.getElementById(`copy${index}`)!,
                    e.clientX - (e.clientX - e.nativeEvent.offsetX),
                    e.clientY - (e.clientY - e.nativeEvent.offsetY),
                  );
                }
              }}
              onMouseDown={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (e.shiftKey) {
                  compRefs.current[w.id]?.classList.toggle("selected");
                  if (!compRefs.current[w.id]?.classList.contains("selected")) {
                    setSelectedIds(
                      selectedIds.filter((f) => f != String(w.id)),
                    );
                  } else {
                    setSelectedIds(selectedIds.concat(String(w.id)));
                  }
                } else {
                  if (!compRefs.current[w.id]?.classList.contains("selected")) {
                    Object.entries(cachedRects.current).map(([id, rect]) => {
                      compRefs.current[id]?.classList.toggle("selected", false);
                      return [id, rect];
                    });
                    setSelectedIds([String(w.id)]);
                    compRefs.current[w.id]?.classList.toggle("selected");
                    // selectedIdsRef.current = [String(w.id)];
                  }
                }
              }}
            >
              <FileFolderComponent
                item={w}
                innerRef={(el: HTMLDivElement | null) => {
                  compRefs.current[w.id] = el;
                }}
                save={(e: React.InputEvent) => {
                  setItems(
                    updatePropById(w.id, {
                      label: (e.target as HTMLTextAreaElement).value,
                    }),
                  );
                }}
              />
              {/* </WindowWrapper> */}
            </div>
          );
        })}

      <div
        id={`copy${index}`}
        style={{
          position: "absolute",
          zIndex: -1,
          left: "-10000px",
          width: "100vw",
          height: "100vh",
        }}
      >
        {activewin.map((activeWin) => (
          <FileFolderComponent key={activeWin.id} item={activeWin} />
        ))}
      </div>

      <SelectionBox innerRef={boxRef} />
    </div>
  );
};

export default Window;
