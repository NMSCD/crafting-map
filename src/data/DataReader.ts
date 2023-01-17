import { FilteredDataProvider } from "./FilteredDataProvider.js";
import { DataType } from "../model/data";
import { Config } from "../model/config";
import { fetchCSV$ } from "./fetchFileData";
import { SearchAction, SearchOpts } from "../model/search";

export class DataReader {
  private data: DataType = {
    nodes: [],
    links: [],
  };
  private filtered!: FilteredDataProvider;
  private _searchOpts: SearchOpts = { search: "", direction: true };

  constructor(private readonly config: Config) {
    this.filtered = new FilteredDataProvider();
  }

  get nodes() {
    const ids = this.filtered.nodesIds;
    if (ids) {
      return this.data.nodes?.filter((n) => ids.includes(n.id));
    }
    return this.data.nodes;
  }

  get links() {
    return this.filtered.links || this.data.links;
  }

  get searchOpts() {
    return this._searchOpts;
  }

  set searchOpts(config) {
    this._searchOpts = config;
    this.filtered.refresh(config, this.data.nodes, this.data.links);
  }

  async fetchCSV$() {
    this.data = await fetchCSV$(this.config);
  }

  triggerAction(action: SearchAction, ...args: any[]) {
    switch (action) {
      case "TOGGLE_DIRECTION":
        this.searchOpts = { ...this._searchOpts, direction: !this._searchOpts.direction };
        return;
      case "RESET_SEARCH":
        this.searchOpts = { search: "", direction: true };
        return;
      case "SEARCH":
        this.searchOpts = { ...this._searchOpts, search: args[0] };
        return;
    }
  }
}
