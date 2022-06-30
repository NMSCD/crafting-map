import { SearchOpts } from "./model/config";

export class ConfigBuilder {
  #config: SearchOpts;

  constructor(config: SearchOpts = {}) {
    this.#config = config;
  }

  search(value) {
    if (!value) {
      delete this.#config.search;
      return this;
    }
    delete this.#config.clickId;
    this.#config.search = value;
    return this;
  }

  clickId(value) {
    if (!value) {
      delete this.#config.clickId;
      return this;
    }
    delete this.#config.search;
    this.#config.clickId = value;
    return this;
  }

  direction(value) {
    this.#config.direction = value;
    return this;
  }

  build(): SearchOpts {
    return this.#config;
  }
}
