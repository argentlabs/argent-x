import { upperFirst } from "lodash-es"

import { ESCAPE_TYPE_GUARDIAN } from "../../../../shared/account/details/escape.model"
import type { useLiveAccountEscape } from "./useAccountEscape"

export const getEscapeDisplayAttributes = (
  liveAccountEscape: ReturnType<typeof useLiveAccountEscape>,
) => {
  if (!liveAccountEscape) {
    return {}
  }
  const { activeFromNowMs, activeFromNowPretty, type } = liveAccountEscape
  const action = type === ESCAPE_TYPE_GUARDIAN ? "removed" : "changed"
  const entity =
    type === ESCAPE_TYPE_GUARDIAN ? "Argent as a guardian" : "Account key"
  const colorScheme: "warning" | "danger" =
    type === ESCAPE_TYPE_GUARDIAN ? "warning" : "danger"
  const bgScheme: "surface-danger-default" | "surface-warning-default" =
    type === ESCAPE_TYPE_GUARDIAN
      ? "surface-warning-default"
      : "surface-danger-default"
  const title =
    activeFromNowMs > 0
      ? `${entity} will be ${action} from this account in ${activeFromNowPretty}`
      : upperFirst(`${entity} removed`)
  return {
    entity,
    colorScheme,
    title,
    bgScheme,
  }
}
