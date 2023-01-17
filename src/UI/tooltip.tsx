import { h, render } from "preact";
import { ConnectionType } from "../model/data";

type TooltipProps = {
  show: boolean;
  showNames: boolean;
  x: number;
  y: number;
  data: ConnectionType[];
};

export function Tooltip({ show, showNames, x, y, data }: TooltipProps) {
  function showConnections() {
    return data.map((c) => {
      return (
        <div class="wrapper">
          {c.resources.map((s) => (
            <div class="flex-col">
              <div class="inner-wrapper">
                <span>{s.count}</span>
                <img src={`assets/${s.node.image}`} alt="src_image" />
              </div>
              <small className={showNames ? "show" : ""}>{s.node.name}</small>
            </div>
          ))}
          <div className="flex-col">
            <span>=</span>
          </div>
          <div class="flex-col">
            <div className="inner-wrapper">
              <span>{c.product.count}</span>
              <img src={`assets/${c.product.node.image}`} alt="con_image" />
            </div>
            <small className={showNames ? "show" : ""}>{c.product.node.name}</small>
          </div>
        </div>
      );
    });
  }

  return (
    <div id="hoverInfo" className={show ? "show" : ""} style={`top: ${10 + y}px; left: ${x}px`}>
      {showConnections()}
    </div>
  );
}

export class TooltipRenderer {
  private readonly el: HTMLDivElement;
  private hoverTimerHandler?: number;
  private namesTimerHandler?: number;

  constructor() {
    this.el = document.createElement("div");
    document.body.appendChild(this.el);
  }

  show(x: number, y: number, data: ConnectionType[]) {
    this.hoverTimerHandler = setTimeout(() => {
      render(h(Tooltip, { show: true, showNames: false, x, y, data }), this.el);
      this.namesTimerHandler = setTimeout(() => {
        render(h(Tooltip, { show: true, showNames: true, x, y, data }), this.el);
      }, 500);
    }, 100);
  }

  hide() {
    clearTimeout(this.hoverTimerHandler);
    clearTimeout(this.namesTimerHandler);
    render(h(Tooltip, { show: false, showNames: false, data: [], x: 0, y: 0 }), this.el);
  }
}
