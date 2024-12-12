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
  const action = type === ESCAPE_TYPE_GUARDIAN ? "Removing" : "Changing"
  const entity = type === ESCAPE_TYPE_GUARDIAN ? "guardian" : "account key"
  const colorScheme: "warning" | "danger" =
    type === ESCAPE_TYPE_GUARDIAN ? "warning" : "danger"
  const title =
    activeFromNowMs > 0
      ? `${action} ${entity} in ${activeFromNowPretty}`
      : upperFirst(`${entity} removed`)
  return {
    entity,
    colorScheme,
    title,
  }
}
