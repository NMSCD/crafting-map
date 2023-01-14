import { D3Renderer } from "./D3Renderer";
import { DataReader } from "./data/DataReader";
import { ConfigBuilder } from "./ConfigBuilder.js";
import { Config } from "./model/config";

const el = document.querySelector("#graph");
const menuEl = document.querySelector("nav") as any;
const height = window.innerHeight;
const width = window.innerWidth;
const iconSize = 32;
const config: Config = { width, height, iconSize, collisionRadius: iconSize * 3, curvedArrows: false };

const data = new DataReader(config);
const renderer = new D3Renderer(config, data);
renderer.build();

data.fetchCSV$().then(() => {
  renderer.refresh();
});
data.config$((config) => {
  menuEl.resetFilters(config);
});

menuEl.addEventListener("filter", ({ detail }) => {
  data.searchOpts = new ConfigBuilder()
    .search(detail.search)
    .direction(detail.direction)
    .clickId(detail.clickId)
    .build();
  renderer.refresh();
});

el.append(renderer.htmlEl);
