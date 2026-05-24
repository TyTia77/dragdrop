import { useStateWithHistory, useDeepCompareEffect } from "toolkit";
import _ from "lodash";
import type { itemType } from "../data/items";

export const useHistory = (items: itemType) => {
  const [getter, setter, history] = useStateWithHistory(items, {
    capacity: 20,
  }) as [
    itemType,
    (v: itemType) => void,
    {
      history: itemType[];
      pointer: number;
      back: () => void;
      forward: () => void;
      go: (index: number) => void;
    },
  ];

  useDeepCompareEffect(() => {
    saveHistory();
  }, [items]);

  function saveHistory() {
    const currentHistoryState = history.history[history.pointer];

    if (!_.isEqual(currentHistoryState, items)) {
      setter(items);
    }
  }

  return history;
};
