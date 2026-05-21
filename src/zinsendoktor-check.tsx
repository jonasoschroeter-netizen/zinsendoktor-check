import { mount } from "./mount";

const api = { mount };

if (typeof window !== "undefined") {
  window.ZinsendoktorCheck = api;
}

export { mount };
