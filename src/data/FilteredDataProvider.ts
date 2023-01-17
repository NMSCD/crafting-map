import { LinkType, NodeType } from "../model/data";
import { SearchOpts } from "../model/search";

export class FilteredDataProvider {
  private config!: SearchOpts;
  private filter: any = {};
  private initialIds?: number[];
  private nodes: NodeType[] = [];
  private allLinks: LinkType[] = [];

  refresh(config: SearchOpts, nodes: NodeType[], links: LinkType[]) {
    this.nodes = nodes;
    this.allLinks = links;
    this.config = config;
    this.filter = {};
    this.initialIds = undefined;

    this.nodeIdsById();
    this.nodeIdsBySearch();
    this.linksIds();
  }

  get nodesIds() {
    return this.filter.nodeIds;
  }
  get links() {
    return this.filter.links;
  }

  private nodeIdsBySearch() {
    const search = this.config.search?.toLowerCase();
    if (!search) {
      return;
    }

    const initialIds = this.nodes.filter((n) => n.name.toLowerCase().includes(search)).map((n) => n.id);

    this.initialIds = initialIds;
    this.filter.nodeIds = this.findMultiNodeIds(initialIds);
  }

  private nodeIdsById() {
    const id = this.config.clickId;
    if (!id) {
      return;
    }
    this.initialIds = [id];
    this.filter.nodeIds = this.findMultiNodeIds([id]);
  }

  private linksIds() {
    const ids = this.initialIds;
    if (!ids) {
      return;
    }

    const keyA = this.config.direction ? "target" : "source";

    this.filter.links = this.allLinks.filter((l) => ids.includes(l[keyA].id));
  }

  private findMultiNodeIds(ids: number[]) {
    const d3LinkData = this.allLinks;
    const keyA = this.config.direction ? "target" : "source";
    const keyB = !this.config.direction ? "target" : "source";

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
