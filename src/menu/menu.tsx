import { Component, createRef, h, render } from "preact";
import { Slider } from "./slider";

class Menu extends Component {
  ref = createRef();
  state = {
    search: "",
    direction: true,
  };

  componentDidMount() {
    this.ref.current.resetFilters = this.resetFilters.bind(this);
  }

  componentDidUpdate() {
    this.ref.current.dispatchEvent(new CustomEvent("filter", { detail: this.state }));
  }

  resetFilters(filters = { direction: true, search: "" }) {
    this.setState({ ...filters });
  }

  changeDirection(e: any) {
    this.setState({ direction: e.target.checked });
  }

  render() {
    return (
      <nav ref={this.ref}>
        <div className="nav-center">
          <button id="refresh" title="Refresh" onClick={() => this.resetFilters()}>
            <div className="material-icons">&#xe5d5;</div>
            Refresh
          </button>
          <div>
            <input
              id="search"
              placeholder="Filtering..."
              name="nms-filter"
              value={this.state.search}
              onInput={(e: any) => this.setState({ search: e.target.value })}
            />
          </div>
          <Slider checked={this.state.direction} onChange={(e) => this.setState({ direction: e })}></Slider>
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
}

render(h(Menu, null), document.body);
