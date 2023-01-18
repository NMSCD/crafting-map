import { D3Simulation } from "./D3Simulation";
import { LinkType } from "../model/data";
import { GEl } from "../model/d3";
import { randomNum, setRandomInterval } from "../utils";
import { easeSinIn, transition } from "d3";
import { StarsAnimationConfig } from "../model/config";

export class D3StarsRenderer {
  private starsEl!: GEl;
  private starsAnimationHandler?: { stop: () => void };
  private links!: LinkType[];
  private numberOfStars = 0;

  constructor(private readonly config: StarsAnimationConfig, simulation: D3Simulation) {
    if (!config.animate) {
      return;
    }
    simulation.onTick(() => this.removeStars());
    simulation.onEnd(() => this.updateStars());
  }

  build(viewPortEl: GEl) {
    this.starsEl = viewPortEl.append("g").classed("stars", true);
  }

  updateLinks(links: LinkType[]) {
    this.removeStars();
    this.links = links;
  }

  removeStars() {
    this.starsAnimationHandler?.stop();
    this.starsEl.selectAll("circle").remove();
  }

  private updateStars() {
    this.removeStars();
    if (!this.links.length) {
      return;
    }
    const maxStars = Math.ceil(this.links.length / 5);
    this.starsAnimationHandler = setRandomInterval(
      () => {
        if (maxStars <= this.numberOfStars) {
          return;
        }
        this.numberOfStars++;
        const idx = randomNum(0, this.links.length - 1);
        this.renderStars([this.links.at(idx) as LinkType]);
        setTimeout(() => {
          this.numberOfStars--;
        }, randomNum(1000, 5000));
      },
      500,
      2000
    );
  }

  private renderStars(data: LinkType[]) {
    const starAnimation = transition().duration(750).ease(easeSinIn);

    const stars = this.starsEl.append("circle").data(data).join("circle").classed("star", true);
    stars.attr("r", 2).attr("transform", (d) => `translate(${d.source.x},${d.source.y})`);
    stars
      .transition(starAnimation as never)
      .attr("transform", (d) => `translate(${d.target.x},${d.target.y})`)
      .remove();
  }
}
