export const snapToGrid = () => {
  const ITEM_GAP = 20;
};

export const overlaps = (rect: DOMRect, sel) =>
  rect.left < sel.x2 &&
  rect.right > sel.x1 &&
  rect.top < sel.y2 &&
  rect.bottom > sel.y1;
