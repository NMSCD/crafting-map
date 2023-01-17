import { DataReader } from "./data/DataReader";
import { D3Renderer } from "./D3Renderer";
import { Config } from "../model/config";
import { SearchOpts } from "../model/search";
import { MenuProps } from "../UI/menu/menuProps";

export class Graph {
  private data: DataReader;
  private renderer: D3Renderer;

  constructor(private readonly domRefresh: () => void, config: Config, opts: SearchOpts) {
    this.data = new DataReader(config, opts);
    this.renderer = new D3Renderer(config);

    document.body.append(this.renderer.htmlEl);

    this.data.fetchCSV$().then(() => {
      this.renderer.refresh(this.data.currentData);
      this.domRefresh();
    });

    this.renderer.config$((action, ...args) => {
      this.data.triggerAction(action, ...args);
      this.renderer.refresh(this.data.currentData);
      this.domRefresh();
    });
  }

  private render() {
    this.renderer.refresh(this.data.currentData);
  }

  get menuProps(): MenuProps {
    return {
      onSearch: this.onSearch.bind(this),
      onDirection: this.onDirection.bind(this),
      onReset: this.onReset.bind(this),
      search: this.data.searchOpts.search,
      direction: this.data.searchOpts.direction,
    };
  }

  onSearch(name: string) {
    this.data.triggerAction("SEARCH", name);
    this.render();
  }

  onDirection() {
    this.data.triggerAction("TOGGLE_DIRECTION");
    this.render();
    this.domRefresh();
  }

  onReset() {
    this.data.triggerAction("RESET_SEARCH");
    this.render();
    this.domRefresh();
  }
}
