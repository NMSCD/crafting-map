const { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } = window.d3;

export class D3Simulation {
  #simulation;
  #config;
  constructor(config) {
    this.#config = config;
    this.#simulation = createSimulation(config);
  }
  restart() {
    this.#simulation.alpha(1).restart();
  }

  resetData(nodes, links) {
    this.#simulation.nodes(nodes);
    this.#simulation.force("link").links(links);
    this.#simulation.force("charge").strength(-5);
    this.#simulation.force("colide").strength(0.5);
    this.restart();
  }

  onTick(cb) {
    this.#simulation.on("tick", cb);
  }
}

function createSimulation({ width, height, collisionRadius }) {
  return forceSimulation()
    .nodes([])
    .force("charge", forceManyBody())
    .force("center", forceCenter(width / 2, height / 2))
    .force("colide", forceCollide(collisionRadius))
    .force("link", forceLink());
}
