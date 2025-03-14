import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import { IS_DEV } from "@argent-x/extension/src/shared/utils/dev"
import { createDebugTranslation } from "@argent-x/extension/src/ui/i18n/createDebugTranslation"
import { I18N_ENABLED } from "@argent-x/extension/src/shared/i18n/constants"
import { noop } from "lodash-es"
import { assetsLocalesBackend } from "./assetsLocalesBackend"

const debugI18n = IS_DEV && process.env.DEBUG_I18N === "true"

if (I18N_ENABLED) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .use(assetsLocalesBackend)
    .init({
      debug: debugI18n,
      lng: "en",
      fallbackLng: "en",
      defaultNS: "translation",
      interpolation: {
        escapeValue: false, // React already escapes values
      },
    })
    .then(() => {
      if (debugI18n) {
        const originalT = i18n.t.bind(i18n)
        i18n.t = createDebugTranslation(originalT)
      }
    })
}

export default I18N_ENABLED
  ? i18n
  : {
      t: (key: string) => `t(${key})`,
      changeLanguage: noop,
      language: "en",
    }
