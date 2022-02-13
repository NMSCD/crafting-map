export class FilteredDataProvider {
  #data;
  #config = {};
  #filter = {};
  #initialIds;

  constructor(data) {
    this.#data = data;
  }

  refresh(config) {
    this.#config = config;
    this.#filter = {};
    this.#initialIds = undefined;

    this.#nodeIdsById();
    this.#nodeIdsBySearch();
    this.#linksIds();
  }

  get nodesIds() {
    return this.#filter.nodeIds;
  }
  get links() {
    return this.#filter.links;
  }

  #nodeIdsBySearch() {
    const search = this.#config.search?.toLowerCase();
    if (!search) {
      return;
    }

    const initialIds = this.#data.allNodes.filter((n) => n.name.toLowerCase().includes(search)).map((n) => n.id);

    this.#initialIds = initialIds;
    this.#filter.nodeIds = this.#findMultiNodeIds(initialIds);
  }

  #nodeIdsById() {
    const id = this.#config.clickId;
    if (!id) {
      return;
    }
    this.#initialIds = [id];
    this.#filter.nodeIds = this.#findMultiNodeIds([id]);
  }

  #linksIds() {
    let ids = this.#initialIds;
    if (!ids) {
      return;
    }

    const keyA = this.#config.direction ? "target" : "source";

    this.#filter.links = this.#data.allLinks.filter((l) => ids.includes(l[keyA].id));
  }

  #findMultiNodeIds(ids) {
    const d3LinkData = this.#data.allLinks;
    const keyA = this.#config.direction ? "target" : "source";
    const keyB = !this.#config.direction ? "target" : "source";

    const nodeIds = d3LinkData.reduce(
      (acc, value) => {
        if (ids.includes(value[keyA].id) && !acc.includes(value[keyB].id)) {
          return [...acc, value[keyB].id];
        }
        return acc;
      },
      [...ids]
    );
    return [...new Set(nodeIds)];
  }
}
