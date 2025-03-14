import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import { assetsLocalesBackend } from "../shared/i18n/assetsLocalesBackend"
import { IS_DEV } from "../shared/utils/dev"
import { I18N_ENABLED } from "../shared/i18n/constants"
import { noop } from "lodash-es"

const debugI18n = IS_DEV && process.env.DEBUG_I18N === "true"

if (I18N_ENABLED) {
  void i18n.use(LanguageDetector).use(assetsLocalesBackend).init({
    debug: debugI18n,
    lng: "en",
    fallbackLng: "en",
    defaultNS: "translation",
  })
}

export default I18N_ENABLED
  ? i18n
  : {
      t: (key: string) => `t(${key})`,
      changeLanguage: noop,
      language: "en",
    }
