import "./polyfill"

import { theme } from "@argent/ui"
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport"
import { Preview } from "@storybook/react"

const CUSTOM_VIEWPORTS = {
  extension: {
    name: "Extension",
    styles: {
      width: "360px",
      height: "600px",
    },
    type: "desktop",
  },
}

export const parameters: Preview["parameters"] = {
  chakra: {
    theme,
  },
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
    exclude: [],
  },
  viewport: {
    viewports: {
      ...INITIAL_VIEWPORTS,
      ...CUSTOM_VIEWPORTS,
    },
    defaultViewport: "extension",
  },
}

export { decorators } from "../src/decorators/globalDecorators"

export { globalTypes } from "./globalTypes"
