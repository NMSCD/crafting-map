const template = document.createElement("template");
template.innerHTML = `
<style>
 nav {
   display: flex;
   align-items: center;
   justify-content: flex-end;
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 40px;
   background: deepskyblue;
 }
 #refresh {
   cursor: pointer
 }
</style>
<nav>
  <span id="refresh" class="material-icons">&#xe5d5;</span>
<!--  <div>-->
<!--    <label>-->
<!--      <input type="radio" name="color" value="byRecipe">-->
<!--      <span>By Recipe</span>-->
<!--    </label>-->
<!--    <label>-->
<!--      <input type="radio" name="color" value="byType">-->
<!--      <span>By Type</span>-->
<!--    </label>-->
<!--  </div>-->
  <label>
    <input id="direction" type="checkbox"><span>BySource</span>
  </label>
  <span class="material-icons">&#xe8b6;</span>
  <input id="search">
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

  resetFilters(
    filters = {
      direction: true,
      search: "",
    }
  ) {
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
