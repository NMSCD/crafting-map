import { Config } from "./model/config";
import { h, render } from "preact";
import { Menu } from "./UI/menu/menu";
import { SearchOpts } from "./model/search";
import { Graph } from "./graph/graph";

const config: Config = {
  width: window.innerWidth,
  height: window.innerHeight,
  iconSize: 32,
  collisionRadius: 90,
  curvedArrows: false,
  starsAnimation: { animate: true },
};

const opts: SearchOpts = {
  search: "",
  direction: true,
};

const graph = new Graph(
  () => {
    render(h(Menu, graph.menuProps), document.body);
  },
  config,
  opts
);
