import { h, render } from "preact";

type TooltipProps = {
  show: boolean;
  showNames: boolean;
  x?: number;
  y?: number;
  connections: {
    source: {
      image: string;
      count: number;
      name: string;
    }[];
    count: number;
    image: number;
    name: string;
  }[];
};

export function Tooltip({ show, showNames, x, y, connections }: TooltipProps) {
  function showConnections() {
    return connections.map((c) => {
      return (
        <div class="wrapper">
          {c.source.map((s) => (
            <div class="flex-col">
              <div class="inner-wrapper">
                <span>{s.count}</span>
                <img src={`assets/${s.image}`} alt="src_image" />
              </div>
              <small className={showNames ? "show" : ""}>{s.name}</small>
            </div>
          ))}
          <div className="flex-col">
            <span>=</span>
          </div>
          <div class="flex-col">
            <div className="inner-wrapper">
              <span>{c.count}</span>
              <img src={`assets/${c.image}`} alt="con_image" />
            </div>
            <small className={showNames ? "show" : ""}>{c.name}</small>
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
  private hoverTimerHandler: number;
  private namesTimerHandler: number;

  constructor() {
    this.el = document.createElement("div");
    document.body.appendChild(this.el);
  }

  show(x: number, y: number, connections) {
    this.hoverTimerHandler = setTimeout(() => {
      render(h(Tooltip, { show: true, showNames: false, x, y, connections }), this.el);
      this.namesTimerHandler = setTimeout(() => {
        render(h(Tooltip, { show: true, showNames: true, x, y, connections }), this.el);
      }, 500);
    }, 100);
  }

  hide() {
    clearTimeout(this.hoverTimerHandler);
    clearTimeout(this.namesTimerHandler);
    render(h(Tooltip, { show: false, showNames: false, connections: [] }), this.el);
  }
}
