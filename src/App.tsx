import Window from "./features/window/window";
import { useItems } from "./context/context";
import DraggableWindow from "./components/draggableWindow";
import { Breadcrumb } from "./components/breadcrumb";

import "./App.css";

function App() {
  const { items, find, setItems, getOpen, updateByIds } = useItems();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        maxWidth: 1125,
        overflow: "hidden",
      }}
    >
      {/* parent level */}
      <Window index={-1} items={items}></Window>

      {items
        .filter((f) => f.type == "folder" && f?.open)
        .map((m) => {
          const f = find(m.id);
          const path1 = getOpen(f.children);

          path1.unshift(m);

          return (
            <DraggableWindow
              key={m.id}
              title=""
              onClose={() => {
                setItems(
                  updateByIds(
                    path1.map((m) => m.id),
                    { open: false },
                  ),
                );
              }}
            >
              <Breadcrumb
                paths={path1.map((p, i) => {
                  return {
                    label: p.label,
                    onClick: () => {
                      setItems(
                        updateByIds(
                          path1.slice(i + 1).map((m) => m.id),
                          { open: false },
                        ),
                      );
                    },
                  };
                })}
              />

              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Window
                  index={path1[path1.length - 1].id}
                  items={path1[path1.length - 1].children}
                  bgcolor={"#1e1e1e"}
                ></Window>
              </div>
            </DraggableWindow>
          );
        })}
    </div>
  );
}

export default App;
