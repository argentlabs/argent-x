import {
  storybookDecorator,
  storybookUIProviderDecorator,
  storybookGlobalTypes,
} from "@argent/x-ui"
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport"
import { Preview } from "@storybook/react"
import { merge } from "lodash-es"

import { theme } from "@argent-x/extension/src/ui/AppThemeProvider"

import { depreactedMuiDecorator } from "../src/decorators/depreactedMuiDecorator"

import mock from "./webextension-polyfill-mock"

/** FIXME: remove when Storybooks gets BigInt support (v8.0) https://github.com/storybookjs/storybook/issues/22452 */
BigInt.prototype["toJSON"] = function () {
  return this.toString()
}

/** mock chrome.runtime / browser.runtime */
if (global.chrome) {
  global.chrome = merge(global.chrome, mock)
}
if (global.browser) {
  global.browser = merge(global.browser, mock)
}

const CUSTOM_VIEWPORTS = {
  extension: {
    name: "Extension",
    styles: {
      width: "360px",
      height: "600px",
    },
    type: "desktop",
  },
  extension2x: {
    name: "Extension 2x",
    styles: {
      width: "720px",
      height: "600px",
    },
    type: "desktop",
  },
}

const preview: Preview = {
  parameters: {
    chakra: {
      theme,
    },
    layout: "fullscreen",
    backgrounds: { disable: true },
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
        ...CUSTOM_VIEWPORTS,
        ...INITIAL_VIEWPORTS,
      },
    },
    options: {
      showPanel: true,
    },
  },
  globalTypes: storybookGlobalTypes,
  decorators: [
    depreactedMuiDecorator,
    storybookDecorator,
    storybookUIProviderDecorator,
  ],
}

export default preview
