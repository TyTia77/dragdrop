import { useItems } from "../../context/context";

export default function ({
  index,
  window,
  windows,
  children,
  selectedIds,
  setSelectedIds,
  onDrop,
  compRefs,
  cachedRects,
  setactivewin,
}: {
  index: number;
  window: any;
  windows: any;
  children: React.ReactNode;
  onDrop: () => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  containerRef: any;
  compRefs: any;
  cachedRects: any;
  setactivewin: () => void;
}) {
  const { setItems, updatePropById } = useItems();

  return (
    <div
      draggable
      //   key={w.id}
      onDoubleClick={(e: React.MouseEvent) => {
        if (window.type == "folder") {
          setSelectedIds([]);
          setItems(updatePropById(window.id, { open: true }));
        }
      }}
      onDrop={(e: React.DragEvent<HTMLElement>) => {
        e.stopPropagation();
        if (window.type == "folder") {
          onDrop({ e, dropto: window.id });
        }
      }}
      onDragStart={(e: React.DragEvent<HTMLElement>) => {
        const windowlist = windows.map((w) => ({
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
          compRefs.current[window.id]?.classList.toggle("selected");

          if (!compRefs.current[window.id]?.classList.contains("selected")) {
            setSelectedIds(selectedIds.filter((f) => f != String(window.id)));
          } else {
            setSelectedIds(selectedIds.concat(String(window.id)));
          }
        } else {
          if (!compRefs.current[window.id]?.classList.contains("selected")) {
            Object.entries(cachedRects.current).map(([id, rect]) => {
              compRefs.current[id]?.classList.toggle("selected", false);
              return [id, rect];
            });

            setSelectedIds([String(window.id)]);
            compRefs.current[window.id]?.classList.toggle("selected");
            // selectedIdsRef.current = [String(w.id)];
          }
        }
      }}
    >
      {children}
    </div>
  );
}
