import { downloadTranslations } from "./utils/downloadTranslations"
import { I18N_ENABLED } from "./config"

if (I18N_ENABLED) {
  downloadTranslations().catch(console.error)
}
