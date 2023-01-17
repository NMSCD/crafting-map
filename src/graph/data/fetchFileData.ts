import { autoType, csvParse } from "d3";
import { DSVParsedArray } from "d3-dsv";
import { ConnectionNode, ConnectionType, DataType, LinkType, NodeType } from "../../model/data";
import { Config } from "../../model/config";
import { assert } from "../../utils";

type ConnectionsCVS = {
  Product: string;
  ProductCount: number;
  Type: string;
  Source_1: string;
  Count_1: number;
  Source_2?: string;
  Count_2?: number;
  Source_3?: string;
  Count_3?: number;
};

type NodesCVS = {
  Name: string;
  Category: string;
  Type: string;
  Value: number;
  Image: string;
  Link: string;
};

function getByName(name: string) {
  return (list: NodeType[]) => {
    return list.find((l) => name === l.name);
  };
}

function parseCSVConnections(data: DSVParsedArray<ConnectionsCVS>, nodes: NodeType[]) {
  return data.map((c) => {
    const source: ConnectionNode[] = [];
    const node = getByName(c.Source_1)(nodes);
    assert(c.Source_1, "parsing error!");
    assert(node, "parsing error!");
    source.push({
      node: node,
      count: c.Count_1,
    });
    if (c.Source_2) {
      const node2 = getByName(c.Source_2)(nodes);
      assert(node2);
      assert(c.Count_2);
      source.push({
        node: node2,
        count: c.Count_2,
      });
    }
    if (c.Source_3) {
      const node3 = getByName(c.Source_3)(nodes);
      assert(node3);
      assert(c.Count_3);
      source.push({
        node: node3,
        count: c.Count_3,
      });
    }
    return {
      type: c.Type,
      resources: source,
      product: {
        node: nodes.find((n) => n.name === c.Product),
        count: c.ProductCount,
      },
    } as ConnectionType;
  });
}

function parseConnectionsToLinks(config: Config, connections: ConnectionType[]) {
  const links = new Map<string, LinkType>();
  connections.forEach((c) => {
    c.resources.forEach((s) => {
      if (c.product.node.id === s.node.id) {
        return;
      }
      const key = `${s.node.id}_${c.product.node.id}`;
      const key2 = `${c.product.node.id}_${s.node.id}`;
      const linkValue = links.get(key);
      const linkVal2 = links.get(key2);
      if (linkValue) {
        linkValue.connections = [...linkValue.connections, c];
      } else if (linkVal2 && !config.curvedArrows) {
        linkVal2.connections = [...linkVal2.connections, c];
        linkVal2.twoWay = true;
      } else {
        links.set(key, {
          source: s.node,
          target: c.product.node,
          connections: [c],
          twoWay: false,
        });
      }
    });
  });
  return [...links.values()];
}

function parseCSVNodes(nodeArray: DSVParsedArray<NodesCVS>): NodeType[] {
  const nodeMap = new Map<string, NodeType>();
  nodeArray.forEach((n, idx) => {
    nodeMap.set(n.Name, {
      name: n.Name,
      id: idx,
      category: n.Category,
      type: n.Type,
      value: n.Value,
      image: n.Image,
      focused: false,
    });
  });
  return [...nodeMap.values()];
}

export async function fetchCSV$(config: Config): Promise<DataType> {
  const nodesRAW = await fetch("assets/data/nodes.csv").then((resp) => resp.text());
  const nodes = parseCSVNodes(csvParse<NodesCVS, string>(nodesRAW, autoType));

  const connectionsRAW = await fetch("assets/data/connections.csv").then((resp) => resp.text());
  const connections = parseCSVConnections(csvParse<ConnectionsCVS, string>(connectionsRAW, autoType), nodes);

  const links = parseConnectionsToLinks(config, connections);

  return { nodes, links };
}
