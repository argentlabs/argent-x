export const parameters = {
  backgrounds: {
    default: "Extension",
    values: [
      {
        name: "White",
        value: "#fff",
      },
      {
        name: "Mid",
        value: "#888",
      },
      {
        name: "Extension",
        value: "#161616",
      },
      {
        name: "Black",
        value: "#000",
      },
    ],
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export { decorators } from "./decorators"
