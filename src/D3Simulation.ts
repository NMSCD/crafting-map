import { Config } from "./model/config";
import { Simulation, SimulationLinkDatum } from "d3-force";
import { D3NodeType, LinkType, NodeType } from "./model/data";

const { forceCollide, forceLink, forceSimulation, forceCenter } = window.d3;

export class D3Simulation {
  #simulation: Simulation<D3NodeType, SimulationLinkDatum<D3NodeType>>;
  #config: Config;

  constructor(config: Config) {
    this.#config = config;
    this.#simulation = createSimulation(config);
  }
  restart() {
    this.#simulation.alpha(1).restart();
  }

  resetData(nodes: NodeType[], links: LinkType[]) {
    this.#simulation.nodes(nodes as D3NodeType[]);
    this.#simulation.force("link", forceLink().links(links).strength(0.07));
    this.restart();
  }

  onTick(cb) {
    this.#simulation.on("tick", cb);
  }

  onEnd(cb) {
    this.#simulation.on("end", cb);
  }
}

function createSimulation({ width, height, collisionRadius }: Config) {
  return forceSimulation<D3NodeType, SimulationLinkDatum<D3NodeType>>()
    .nodes([])
    .force("center", forceCenter(width / 2, height / 2))
    .force("colide", forceCollide(collisionRadius).strength(0.2));
}
