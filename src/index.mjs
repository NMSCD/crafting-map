import { D3Renderer } from "./D3Renderer.mjs";
import { DataReader } from "./data/DataReader.mjs";
import { ConfigBuilder } from "./ConfigBuilder.mjs";

const el = document.querySelector("#graph");
const menuEl = document.querySelector("ak-menu");
const height = window.innerHeight;
const width = window.innerWidth;
const iconSize = 32;
const config = { width, height, iconSize, collisionRadius: iconSize * 3 };

const data = new DataReader();
const renderer = new D3Renderer(config, data);
renderer.build();
// data.fetchJSON$().then(() => {
//   renderer.refresh();
// });

data.fetchCSV$().then(() => {
  renderer.refresh();
});
data.config$((config) => {
  menuEl.resetFilters(config);
});

menuEl.addEventListener("filter", ({ detail }) => {
  data.config = new ConfigBuilder().search(detail.search).direction(detail.direction).clickId(detail.clickId).build();
  renderer.refresh();
});

el.append(renderer.htmlEl);
