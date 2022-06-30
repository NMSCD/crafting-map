import { FilteredDataProvider } from "./FilteredDataProvider.mjs";
import { ConnectionType, DataType, LinkType } from "../model/data";
import { Config, SearchOpts } from "../model/config";

// @ts-ignore
const { autoType, csvParse } = d3;

function parseCSVConnections(data, nodes) {
  return data.map((c, idx) => {
    const source = [];
    if (!c.Source_1) {
      throw new Error("parsing error!");
    }
    source.push({
      id: nodes.get(c.Source_1).id,
      count: c.Count_1,
    });
    if (c.Source_2) {
      source.push({
        id: nodes.get(c.Source_2).id,
        count: c.Count_2,
      });
    }
    if (c.Source_3) {
      source.push({
        id: nodes.get(c.Source_3).id,
        count: c.Count_3,
      });
    }
    return {
      source,
      targetId: nodes.get(c.Target).id,
      count: c.TargetCount,
      connectionIdx: idx,
      type: c.Type,
    };
  });
}

function parseConnectionsToLinks(config: Config, connections: ConnectionType[]) {
  const links = new Map<string, LinkType>();
  connections.forEach((c, idx) => {
    c.source.forEach((s) => {
      const key = `${s.id}_${c.targetId}`;
      const key2 = `${c.targetId}_${s.id}`;
      if (links.has(key)) {
        links.get(key).connectionIdx = [...links.get(key).connectionIdx, idx];
      } else if (links.has(key2) && !config.curvedArrows) {
        links.get(key2).connectionIdx = [...links.get(key2).connectionIdx, idx];
        links.get(key2).twoWay = true;
      } else {
        links.set(key, {
          source: s.id,
          target: c.targetId,
          connectionIdx: [idx],
        });
      }
    });
  });
  return links;
}

export class DataReader {
  #data: DataType = {};

  constructor(private readonly config: Config) {
    this.#filtered = new FilteredDataProvider(this);
  }

  #filtered;
  #configCB$;

  private _searchOpts: SearchOpts;

  get nodes() {
    let ids = this.#filtered.nodesIds;
    if (ids) {
      return this.#data.nodes.filter((n) => ids.includes(n.id));
    }
    return this.#data.nodes;
  }

  get links() {
    return this.#filtered.links || this.#data.links;
  }

  get searchOpts() {
    return this._searchOpts;
  }

  set searchOpts(config) {
    this._searchOpts = config;
    this.#filtered.refresh(config);
  }

  config$(cb) {
    this.#configCB$ = cb;
  }

  changeConfig(config) {
    this.searchOpts = config;
    this.#configCB$(config);
  }

  get allNodes() {
    return this.#data.nodes;
  }

  get allLinks() {
    return this.#data.links;
  }

  connectionsDataByIdxes(idxs) {
    const connections = idxs.map((idx) => this.#data.connections[idx]);
    return connections.map((c) => {
      return {
        ...c,
        ...this.#data.nodes.find((node) => node.id === c.targetId),
        source: c.source.map((s) => {
          return {
            ...this.#data.nodes.find((node) => node.id === s.id),
            ...s,
          };
        }),
      };
    });
  }

  async fetchCSV$() {
    let response = await fetch("assets/data/nodes.csv");
    let data = await response.text();
    const nodes = parseCSVNodes(csvParse(data, autoType));

    response = await fetch("assets/data/connections.csv");
    data = await response.text();

    const connections = parseCSVConnections(csvParse(data, autoType), nodes);
    const links = parseConnectionsToLinks(this.config, connections);
    this.#data.nodes = [...nodes.values()];
    this.#data.connections = connections;
    this.#data.links = [...links.values()];
  }
}

function parseCSVNodes(nodeArray) {
  const nodeMap = new Map();
  nodeArray.forEach((n, idx) => {
    nodeMap.set(n.Name, {
      name: n.Name,
      id: idx,
      category: n.Category,
      type: n.Type,
      value: n.Value,
      image: n.Image,
    });
  });
  return nodeMap;
}
