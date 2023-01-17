export type MenuProps = {
  search: string;
  direction: boolean;
  onSearch: (name: string) => void;
  onDirection: (checked: boolean) => void;
  onReset: () => void;
};
