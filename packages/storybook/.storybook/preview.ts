import {
  makeStorybookDecorator,
  storybookGlobalTypes,
  storybookUIProviderDecorator,
} from "@argent/x-ui"
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport"
import { Preview } from "@storybook/react"
import { merge } from "lodash-es"

import {
  AppThemeProvider,
  theme,
} from "@argent-x/extension/src/ui/AppThemeProvider"

import mock from "./webextension-polyfill-mock"

import "../src/i18n/i18n"
import { i18nGlobalTypes } from "../src/i18n/globalTypes"
import { storybookI18nDecorator } from "../src/i18n/storybookI18nDecorator"

const storybookDecorator = makeStorybookDecorator(AppThemeProvider)

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
  globalTypes: {
    ...storybookGlobalTypes,
    ...i18nGlobalTypes,
  },
  decorators: [
    storybookI18nDecorator,
    storybookDecorator,
    storybookUIProviderDecorator,
  ],
}

export default preview
