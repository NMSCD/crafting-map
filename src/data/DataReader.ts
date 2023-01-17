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
  private _searchOpts!: SearchOpts;

  constructor(private readonly config: Config, searchOpts: SearchOpts) {
    this.filtered = new FilteredDataProvider();
    this._searchOpts = searchOpts;
  }

  get nodes() {
    return this.filtered.nodes;
  }

  get links() {
    return this.filtered.links;
  }

  get searchOpts() {
    return this._searchOpts;
  }

  set searchOpts(config) {
    this._searchOpts = config;
    this.filtered.refresh(config, this.data);
  }

  async fetchCSV$() {
    this.data = await fetchCSV$(this.config);
    this.filtered.refresh(this._searchOpts, this.data);
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
