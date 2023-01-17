import { Slider } from "./slider";
import { MenuProps } from "./menuProps";

export function Menu(props: MenuProps) {
  return (
    <nav>
      <div className="nav-center">
        <button id="refresh" title="Refresh" onClick={() => props.onReset()}>
          <div className="material-icons">&#xe5d5;</div>
          Refresh
        </button>
        <div>
          <input
            id="search"
            placeholder="Filtering..."
            name="nms-filter"
            value={props.search}
            onInput={(e: any) => props.onSearch(e.target.value)}
          />
        </div>
        <Slider checked={props.direction} onChange={(e) => props.onDirection(e)}></Slider>
        <div className="info">
          <p>RightClick on element to filter by it!</p>
          <p>Click & drag on empty space to move around</p>
          <p>Click & drag to move element!</p>
          <p>Click on dragged element to make it float again</p>
        </div>
      </div>
    </nav>
  );
}
