import type { Preview } from "@storybook/react"

import { availableLng } from "@argent-x/extension/src/shared/i18n/constants"
import i18n from "./i18n"

export const i18nGlobalTypes: Preview["globalTypes"] = {
  locale: {
    title: "i18n",
    defaultValue: i18n.language || "en",
    toolbar: {
      icon: "globe",
      items: availableLng,
      dynamicTitle: true,
    },
  },
}
