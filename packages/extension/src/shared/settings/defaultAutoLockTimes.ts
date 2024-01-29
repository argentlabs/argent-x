import { IS_DEV } from "../utils/dev"

export const defaultAutoLockTimesMinutes = [
  0,
  1,
  5,
  10,
  15,
  30,
  1 * 60,
  4 * 60,
  8 * 60,
  24 * 60,
] as const

export const defaultAutoLockTimeMinutes = IS_DEV ? 24 * 60 : 30

export const getTitleForAutoLockTimeMinutes = (minutes: number) => {
  if (minutes === 0) {
    return "Immediately"
  }
  if (minutes === 1) {
    return "1 minute"
  }
  if (minutes === 60) {
    return "1 hour"
  }
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.round(minutes / 60)
  return `${hours} hours`
}
