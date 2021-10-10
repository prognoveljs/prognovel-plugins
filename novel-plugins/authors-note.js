const html = (id) => `
  ${style}
  <article>
    <div class="wrapper">
      <strong>${id} <span style="font-weight: 400;">says</span></strong>
      <slot>
    </div>
  </article>
`;

class AuthorsNote extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const id = this.getAttribute("id");
    this.shadowRoot.innerHTML = html(id);
  }
}
