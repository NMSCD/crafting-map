export type MenuProps = {
  search: string;
  direction: boolean;
  curvedArrows: boolean;
  onCurvedArrows: (v: boolean) => void;
  onSearch: (name: string) => void;
  onDirection: (checked: boolean) => void;
  onReset: () => void;
};
