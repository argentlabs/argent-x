import { isNumeric, pluralise } from "@argent/x-shared"

export const getActiveFromNow = (activeAt: number, now = new Date()) => {
  if (!isNumeric(activeAt)) {
    throw "activeAt should be numeric"
  }
  const activeFromNowMs = Math.max(0, activeAt * 1000 - now.getTime())
  /** 7 days max */
  const seconds = Math.floor((activeFromNowMs / 1000) % 60)
  const minutes = Math.floor((activeFromNowMs / (1000 * 60)) % 60)
  const hours = Math.floor((activeFromNowMs / (1000 * 60 * 60)) % 24)
  const days = Math.floor(activeFromNowMs / (1000 * 60 * 60 * 24))
  const daysCeil = Math.ceil(activeFromNowMs / (1000 * 60 * 60 * 24))
  const activeFromNowPretty =
    days > 0
      ? pluralise(daysCeil, "day")
      : hours > 0
        ? pluralise(hours, "hour")
        : minutes > 0
          ? pluralise(minutes, "minute")
          : seconds > 0
            ? pluralise(seconds, "second")
            : "now"
  return {
    activeFromNowMs,
    activeFromNowPretty,
  }
}
