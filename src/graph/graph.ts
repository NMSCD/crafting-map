import { DataReader } from "./data/DataReader";
import { D3Renderer } from "./D3Renderer";
import { Config } from "../model/config";
import { SearchOpts } from "../model/search";
import { MenuProps } from "../UI/menu/menuProps";

export class Graph {
  private data: DataReader;
  private renderer: D3Renderer;

  constructor(private readonly domRefresh: () => void, private config: Config, private opts: SearchOpts) {
    this.renderer = new D3Renderer(config);
    this.data = new DataReader(this.config, this.opts);

    document.body.append(this.renderer.htmlEl);
    this.fetchData();

    this.renderer.config$((action, ...args) => {
      this.data.triggerAction(action, ...args);
      this.renderer.refresh(this.data.currentData);
      this.domRefresh();
    });
  }

  private fetchData() {
    this.data.fetchCSV$().then(() => {
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
      curvedArrows: this.config.curvedArrows,
      onCurvedArrows: this.onCurvedArrows.bind(this),
    };
  }

  private onCurvedArrows(v: boolean) {
    this.config.curvedArrows = v;
    this.renderer.arrows = v;
    this.data = new DataReader(this.config, this.data.searchOpts);
    this.fetchData();
  }

  private onSearch(name: string) {
    this.data.triggerAction("SEARCH", name);
    this.render();
  }

  private onDirection() {
    this.data.triggerAction("TOGGLE_DIRECTION");
    this.render();
    this.domRefresh();
  }

  private onReset() {
    this.data.triggerAction("RESET_SEARCH");
    this.render();
    this.domRefresh();
  }
}
