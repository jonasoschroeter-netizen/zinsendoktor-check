import { mount } from "./zinsendoktor-check";

mount("#zinsendoktor-check", {
  mode: "anonymous",
  enableLeadForm: false,
  storage: false,
  theme: {
    primaryColor: "#0B1F3A",
    accentColor: "#1FA37A"
  }
});
