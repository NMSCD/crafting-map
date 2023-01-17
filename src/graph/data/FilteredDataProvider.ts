import { DataType, NodeType } from "../../model/data";
import { SearchOpts } from "../../model/search";
import { haveCommonElements, unique } from "../../utils";

export class FilteredDataProvider {
  private config!: SearchOpts;
  private initialIds?: number[];
  private fullData: DataType = {
    nodes: [],
    links: [],
  };
  private filteredData: DataType = {
    nodes: [],
    links: [],
  };

  refresh(config: SearchOpts, data: DataType) {
    this.fullData = data;
    this.config = config;
    this.fullData.nodes.forEach((n) => (n.focused = false));
    this.initialIds = undefined;

    this.filerNodes();
    this.filterLinks();
    this.filterConnections();
  }

  get nodes() {
    return this.filteredData.nodes;
  }
  get links() {
    return this.filteredData.links;
  }

  private filerNodes() {
    const search = this.config.search?.toLowerCase();
    if (!search) {
      this.filteredData.nodes = this.fullData.nodes;
      return;
    }
    this.initialIds = this.fullData.nodes.filter((n) => n.name.toLowerCase().includes(search)).map((n) => n.id);
    this.filteredData.nodes = this.findRelatedNodes(this.initialIds);
  }

  private filterLinks() {
    const ids = this.initialIds;
    if (!ids) {
      this.filteredData.links = this.fullData.links;
      return;
    }

    const keyA = this.config.direction ? "target" : "source";
    if (this.config.direction) {
      this.filteredData.links = this.fullData.links.filter((l) => ids.includes(l[keyA].id));
    } else {
      this.filteredData.links = this.fullData.links.filter((l) => {
        return l.connections.find((c) => c.resources.find((r) => ids.includes(r.node.id)));
      });
    }
  }

  private filterConnections() {
    const ids = this.initialIds;
    if (!ids) {
      return;
    }
    this.filteredData.links = this.filteredData.links.map((l) => ({
      ...l,
      connections: [
        ...l.connections.filter((c) => {
          if (this.config.direction) {
            return ids.includes(c.product.node.id);
          } else {
            return haveCommonElements(
              ids,
              c.resources.map((r) => r.node.id)
            );
          }
        }),
      ],
    }));
  }

  private findRelatedNodes(initialIds: number[]): NodeType[] {
    const initialNodes = this.fullData.nodes.filter((n) => initialIds.includes(n.id));
    let linkNodes: NodeType[];

    function focusNode(node: NodeType) {
      node.focused = initialIds.includes(node.id);
      return node;
    }
    if (this.config.direction) {
      linkNodes = this.fullData.links
        .filter((l) => initialIds.includes(l.target.id) || initialIds.includes(l.source.id))
        .map((l) => l.source);
    } else {
      linkNodes = this.fullData.links
        .filter((l) => {
          return l.connections.find((c) => c.resources.find((r) => initialIds.includes(r.node.id)));
        })
        .map((l) => [l.source, l.target])
        .flat();
    }

    return unique([...linkNodes, ...initialNodes]).map((n) => focusNode(n));
  }
}
