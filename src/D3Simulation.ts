import { Config } from "./model/config";
import { Simulation, SimulationLinkDatum } from "d3-force";
import { LinkType, NodeType } from "./model/data";
import { forceCenter, forceCollide, forceLink, forceSimulation } from "d3";

export class D3Simulation {
  private simulation: Simulation<NodeType, SimulationLinkDatum<NodeType>>;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.simulation = createSimulation(config);
  }
  restart() {
    this.simulation.alpha(1).restart();
  }

  resetData(nodes: NodeType[], links: LinkType[]) {
    this.simulation.nodes(nodes);
    this.simulation.force("link", forceLink().links(links).strength(0.07));
    this.restart();
  }

  onTick(cb: () => void) {
    this.simulation.on("tick", cb);
  }

  onEnd(cb: () => void) {
    this.simulation.on("end", cb);
  }
}

function createSimulation({ width, height, collisionRadius }: Config) {
  return forceSimulation<NodeType, SimulationLinkDatum<NodeType>>()
    .nodes([])
    .force("center", forceCenter(width / 2, height / 2))
    .force("colide", forceCollide(collisionRadius).strength(0.2));
}
