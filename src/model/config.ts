export type StarsAnimationConfig = {
  animate: boolean;
};

export type Config = {
  width: number;
  height: number;
  iconSize: number;
  collisionRadius: number;
  curvedArrows: boolean;
  starsAnimation: StarsAnimationConfig;
};

export type SearchOpts = {
  search?: any;
  direction?: any;
  clickId?: any;
};
