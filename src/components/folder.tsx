export const FolderIcon = ({ color = "#EF9F27", stroke = "#BA7517" }) => (
  <svg width="72" height="64" viewBox="0 0 72 64" fill="none">
    <path
      d="M4 14C4 11.8 5.8 10 8 10H28L34 18H64C66.2 18
         68 19.8 68 22V56C68 58.2 66.2 60 64 60H8C5.8
         60 4 58.2 4 56V14Z"
      fill={stroke}
      stroke={stroke}
      strokeWidth="1"
    />
    <path
      d="M4 22H68V56C68 58.2 66.2 60 64 60H8C5.8 60
         4 58.2 4 56V22Z"
      fill={color}
      stroke={stroke}
      strokeWidth="1"
    />
  </svg>
);
