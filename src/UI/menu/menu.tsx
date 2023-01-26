import { MenuProps } from "./menuProps";
import { RefreshSvg } from "./icons/refresh";
import { QuestionSVG } from "./icons/question";
import { useState } from "preact/compat";

export function Menu(props: MenuProps) {
  const [showInfo, setShowInfo] = useState(false);
  const isRecipe = props.direction;
  const isUsage = !props.direction;
  return (
    <nav>
      <div className="nav-left">
        <button id="refresh" title="Refresh view" onClick={() => props.onReset()}>
          <RefreshSvg />
        </button>
        <button id="help" title="Help" onClick={() => setShowInfo(!showInfo)} className={showInfo ? "active" : ""}>
          <QuestionSVG />
        </button>
      </div>
      <div className="nav-center">
        <input
          type="text"
          placeholder="Type to filter..."
          value={props.search}
          onInput={(e: any) => props.onSearch(e.target.value)}
        />

        <div className="type-radio">
          <label>Type</label>
          <span className={isRecipe ? "checked" : ""} onClick={() => props.onDirection(!props.direction)}>
            Recipe
          </span>
          <span className={isUsage ? "checked" : ""} onClick={() => props.onDirection(!props.direction)}>
            Usage
          </span>
        </div>

        <div className="checkbox-wrapper">
          <label className="switch">
            <input
              type="checkbox"
              checked={props.curvedArrows}
              onChange={() => props.onCurvedArrows(!props.curvedArrows)}
            />
            <span className="slider"></span>
          </label>
          <span>fancy lines</span>
        </div>
      </div>
      <div id="help-info" className={showInfo ? "nav-center" : "nav-center hidden"}>
        <p>Click & drag on empty space to move around</p>
        <p>Use scroll wheel to zoom in/out</p>
        <p>RightClick on element to filter by it!</p>
        <p>Click & drag to lock element!</p>
        <p>Click on locked element to make it float again</p>
      </div>
    </nav>
  );
}
