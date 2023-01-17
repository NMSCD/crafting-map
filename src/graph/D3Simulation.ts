import { Config } from "../model/config";
import { Simulation, SimulationLinkDatum } from "d3-force";
import { LinkType, NodeType } from "../model/data";
import { forceCollide, forceLink, forceSimulation } from "d3";
import funcyCenteringForce from "./funcyCenteringForce";

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
    this.simulation.force(
      "center",
      funcyCenteringForce(this.config.width / 2, this.config.height / 2).strength((d: NodeType) =>
        d.focused ? 1 : 0.3
      )
    );
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
  return (
    forceSimulation<NodeType, SimulationLinkDatum<NodeType>>()
      .nodes([])
      // .force("center", forceCenter(width / 2, height / 2))
      .force("colide", forceCollide(collisionRadius).strength(0.2))
  );
}
