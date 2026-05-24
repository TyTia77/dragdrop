import { createContext, useContext, useState, useEffect } from "react";
import { folder, file } from "../data/items";
import type { itemType, fileType, folderType } from "../data/items";
import { useLocalStorage } from "toolkit";
import { useHistory } from "./history.hook";

// export interface CartItem extends Product {
//   quantity: number;
// }

// interface ContextType {
//   items: CartItem[];
//   addToCart: (product: Product) => void;
//   removeFromCart: (id: number) => void;
//   updateQuantity: (id: number, quantity: number) => void;
//   clearCart: () => void;
//   totalItems: number;
//   totalPrice: number;
// }

type contextType = {
  items: itemType;
  add: any;
  find: any;
  setItems: any;
  updateItems: any;
  setopen: any;
  updatePropById: any;
  getOpen: any;
  updateByIds: any;
  history: any;
};

const ItemContext = createContext<contextType | null>(null);

export function Provider({ children }: { children: React.ReactNode }) {
  const [localStorage, setLocalStorage] = useLocalStorage("dragdrop", {
    items: [],
  });
  const [items, setItems] = useState<(fileType | folderType)[]>(
    localStorage?.items || [],
  );

  const history = useHistory(items);

  useEffect(() => {
    const current = history.history[history.pointer];

    // -1 = parent level
    updateItems(-1, current, "replace");
  }, [history.pointer]);

  useEffect(() => {
    setLocalStorage({ items });
  }, [items]);

  const recur = (
    id: number,
    items: (fileType | folderType)[],
  ): fileType | folderType | undefined => {
    for (const item of items) {
      if (item.id == id) return item;
      else if (item.type == "folder") {
        const found = recur(id, item.children);
        if (found) return found;
      }
    }
  };

  const find = (id: number) => {
    if (id == -1) return items;

    const result = recur(id, items);
    return result;
  };

  // adding items(folder/file)
  const updateById = (
    id: number,
    newData: itemType,
    _items = items,
  ): (fileType | folderType)[] => {
    if (id == -1) return _items.concat(newData);

    return _items.map((item) => {
      if (item.id === id) {
        return item.type === "folder"
          ? { ...item, children: item.children.concat(newData) }
          : { ...item, ...newData };
      }

      return item.type == "folder"
        ? {
            ...item,
            children: updateById(id, newData, item.children), // recurse if exists
          }
        : item;

      // if (item.type == "folder") {
      //   return {
      //     ...item,
      //     children: updateById(id, newData, item.children), // recurse if exists
      //   };
      // } else {
      //   return item;
      // }
    });
  };

  // replace with new items(folder/file)
  const replaceById = (
    id: number,
    newData: itemType,
    _items = items,
  ): itemType => {
    if (id == -1) return newData;

    return _items.map((item) => {
      if (item.id === id) {
        return item.type === "folder"
          ? { ...item, children: newData }
          : { ...item, ...newData };
      }

      return item.type == "folder"
        ? {
            ...item,
            children: replaceById(id, newData, item.children),
          }
        : {
            ...item,
          };

      // if (item.type == "folder") {
      //   return {
      //     ...item,
      //     children: replaceById(id, newData, item.children), // recurse if exists
      //   };
      // } else {
      //   return {
      //     ...item,
      //   };
      // }
    });
  };

  const updateItems = (
    id: number,
    data: itemType,
    type?: "replace" | undefined,
  ) => {
    if (type == "replace") {
      setItems((items) => replaceById(id, data, items));
    } else {
      setItems((items) => updateById(id, data, items));
    }
  };

  const setopen = (id: number) => {
    setItems((s) => {
      return s.map((m) =>
        m.id == id && m.type == "folder" ? { ...m, open: !m.open } : m,
      );
    });
  };

  // add new icons
  const add = (id: number, type: "file" | "folder") => {
    if (id == -1) {
      updateItems(
        id,
        type == "folder"
          ? [{ ...folder, id: Date.now() }]
          : [{ ...file, id: Date.now() }],
      );
    } else {
      updateItems(
        id,
        type == "folder"
          ? [{ ...folder, id: Date.now() }]
          : [{ ...file, id: Date.now() }],
      );
    }
  };

  // update props by group ids
  const updateByIds = (
    ids: number[],
    newData: Partial<fileType | folderType>,
    _items = items,
  ): (fileType | folderType)[] =>
    _items.map((item) => {
      const match = ids.includes(item.id);

      return {
        ...(match ? { ...item, ...newData } : item),
        ...((item.type === "folder" && {
          children: updateByIds(ids, newData, item.children),
        }) as folderType),
      };

      // return {
      //   ...(match ? { ...item, ...newData } : item),
      //   children: item.type === "folder"
      //     ? updateByIds(ids, newData, item.children)
      //     : item.children,
      // };

      // if (match) return { ...item, ...newData } as fileType | folderType;

      // return item.type === "folder"
      //   ? { ...item, children: updateByIds(ids, newData, item.children) }
      //   : { ...item };

      // if (match) {
      //   return item.type === "folder"
      //     ? { ...item, children: updateByIds(ids, newData, item.children) }
      //     : ({ ...item, ...newData } as fileType | folderType);
      // } else {
      //   return item;
      // }
    });

  // update props by id
  const updatePropById = (
    id: number,
    newData: Partial<fileType | folderType>,
    _items = items,
  ): (fileType | folderType)[] =>
    _items.map((item) => {
      if (item.id === id)
        return { ...item, ...newData } as fileType | folderType;

      return item.type === "folder"
        ? {
            ...item,
            children: updatePropById(id, newData, item.children),
          }
        : { ...item };
      // return item.children?.length
      //   ? {
      //       ...item,
      //       children: item.children?.length
      //         ? updatePropById(id, newData, item.children)
      //         : item.children,
      //     }
      //   : { ...item };
    });

  const getOpen = (_items = items): (fileType | folderType)[] =>
    _items.flatMap((item) => {
      if (!item?.open) return [];

      return [
        item,
        ...getOpen(item.type === "folder" ? item.children : []), // recurse into children
      ];
    });

  return (
    <ItemContext.Provider
      value={{
        items,
        add,
        find,
        setItems,
        updateItems,
        setopen,
        updatePropById,
        getOpen,
        updateByIds,
        history,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("useItems must be used within ItemProvider");
  return ctx;
}
