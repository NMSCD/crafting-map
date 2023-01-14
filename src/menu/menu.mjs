const template = document.createElement("template");
template.innerHTML = `
<style>
nav {
  position: fixed;
  bottom: 0;
  right: 0;
  color: white
}
.nav-center {
  display: flex;
  flex-direction: column;
  background-color: var(--box-bg);
  border: var(--box-border) 1px solid;
  border-radius: 1rem 0 0 1rem;
  padding: 1rem;
}
.nav-center > * {
  margin-bottom: 10px;
}
#search {
  font-size: 1.5rem;
}
#refresh {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<nav>
  <div class="nav-center">
    <button id="refresh" title="Refresh">
      <div class="material-icons" >&#xe5d5;</div> Refresh
    </button>
    <div>
      <input id="search" placeholder="Filtering..." name="nms-filter">
    </div>
    <label>
      <input id="direction" type="checkbox"><span>Filter by product/source</span>
    </label>
    <div class="info">
      <p>RightClick on element to filter by it!</p>
      <p>Click & drag on empty space to move around</p>
      <p>Click & drag to move element!</p>
      <p>Click on dragged element to make it float again</p>
    </div>
  </div>
</nav>
`;

export class Menu extends HTMLElement {
  #searchEl;
  #directionEl;
  #abort = new AbortController();
  #filters;

  constructor() {
    super();
    this.appendChild(template.content);
    this.#searchEl = this.querySelector("#search");
    this.#directionEl = this.querySelector("#direction");
    this.resetFilters();
  }

  resetFilters(filters = { direction: true, search: "" }) {
    this.#filters = filters;
    this.#searchEl.value = filters.search || "";
    this.#directionEl.checked = !!filters.direction;
  }

  connectedCallback() {
    console.log("Rating added to DOM");
    this.#searchEl.addEventListener(
      "input",
      (event) => {
        this.#filters.search = event.target.value;
        this.#emit();
      },
      { signal: this.#abort.signal }
    );
    this.querySelector("#refresh").addEventListener(
      "click",
      () => {
        this.resetFilters();
        this.#emit();
      },
      { signal: this.#abort.signal }
    );
    this.querySelector("#direction").addEventListener(
      "input",
      (ev) => {
        this.#filters.direction = ev.target.checked;
        this.#emit();
      },
      { signal: this.#abort.signal }
    );
  }

  adoptedCallback() {
    console.log("Rating was moved into a new DOM", arguments);
  }

  disconnectedCallback() {
    this.#abort.abort();
    console.log("Destroy");
  }

  attributeChangedCallback() {
    console.log("Change cb", arguments);
  }

  #emit() {
    this.dispatchEvent(new CustomEvent("filter", { detail: this.#filters }));
    console.log(this.#filters);
  }
}

window.customElements.define("ak-menu", Menu);
