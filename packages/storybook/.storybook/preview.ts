export const parameters = {
  backgrounds: {
    default: "Black",
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
