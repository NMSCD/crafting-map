import { D3Renderer } from "./D3Renderer";
import { DataReader } from "./data/DataReader";
import { Config } from "./model/config";
import { h, render } from "preact";
import { Menu } from "./UI/menu/menu";

const height = window.innerHeight;
const width = window.innerWidth;
const iconSize = 32;
const config: Config = {
  width,
  height,
  iconSize,
  collisionRadius: iconSize * 3,
  curvedArrows: false,
  starsAnimation: { animate: true },
};

const data = new DataReader(config);
const renderer = new D3Renderer(config);
renderer.build();

data.fetchCSV$().then(() => {
  renderer.refresh(data);
});

renderer.config$((action, ...args) => {
  data.triggerAction(action, ...args);
  renderer.refresh(data);
  renderMenu();
});

function onSearch(name: string) {
  data.triggerAction("SEARCH", name);
  renderer.refresh(data);
}

function onDirection() {
  data.triggerAction("TOGGLE_DIRECTION");
  renderer.refresh(data);
  renderMenu();
}

function onReset() {
  data.triggerAction("RESET_SEARCH");
  renderer.refresh(data);
  renderMenu();
}

function renderMenu() {
  render(
    h(Menu, {
      onSearch,
      onDirection,
      onReset,
      search: data.searchOpts.search,
      direction: data.searchOpts.direction,
    }),
    document.body
  );
}
renderMenu();
document.body.append(renderer.htmlEl);
