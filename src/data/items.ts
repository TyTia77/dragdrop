export type itemType = (fileType | folderType)[];

export type fileType = {
  id: number;
  label: string;
  type: "file";
  selected: boolean;
  x: number;
  y: number;
  xoffset: number;
  yoffset: number;
  open: boolean;
};

export type folderType = Omit<fileType, "type"> & {
  type: "folder";
  children: itemType;
};

export const file: fileType = {
  id: -1,
  label: "untitled",
  type: "file",
  selected: false,
  x: 50,
  y: 50,
  xoffset: 0,
  yoffset: 0,
  open: false,
};

export const folder: folderType = {
  ...file,
  type: "folder",
  // size: {},
  children: [],
};
