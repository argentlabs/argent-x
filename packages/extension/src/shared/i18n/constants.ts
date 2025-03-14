import { IS_DEV } from "../../shared/utils/dev"

export const debugI18n = IS_DEV && process.env.DEBUG_I18N === "true"

export const availableLng = ["en", "vi", "zh_CN", "tr", "uk", "ru"]

export const I18N_ENABLED = process.env.FEATURE_I18N === "true"
