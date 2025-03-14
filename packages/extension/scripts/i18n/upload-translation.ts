import { uploadTranslation } from "./utils/uploadTranslation"
import { I18N_ENABLED } from "./config"

if (I18N_ENABLED) {
  uploadTranslation().catch(console.error)
}
