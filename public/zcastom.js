{
  customElements.define(
    "user-card",
    class extends HTMLElement {
      connectedCallback() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
      <div>Имя:
        <slot name="username"></slot>
      </div>
      <div>Дата рождения:
        <slot name="birthday"></slot>
      </div>
    `;
      }
    }
  );

  const el = document.createElement("user-card");
  function createCart(slot, context) {
    const span = document.createElement("span");
    span.slot = slot;
    span.textContent = context;
    el.append(span);
  }
  createCart("username", "Иван Иванов");
  createCart("birthday", "01.01.2001");

  main.append(el);

  // main.append("");

  // <user-card>
  //   <span slot="username">Иван Иванов</span>
  //   <span slot="birthday">01.01.2001</span>
  // </user-card>

  const select = document.createElement("select");
  for (let i = 0; i < 60; i += 5) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    select.append(option);
  }

  const select2 = document.createElement("select");
  for (let i = 8; i < 19; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    select2.append(option);
  }
  main.append(select2);
  main.append(select);
}
