const fallbackIntervals = {
  FAST: "20",
  MEDIUM: "60",
  SLOW: "300",
  VERY_SLOW: "86400",
}

export const RefreshInterval = Object.freeze({
  FAST: parseInt(process.env.REFRESH_INTERVAL_FAST || fallbackIntervals.FAST), // 20s
  MEDIUM: parseInt(
    process.env.REFRESH_INTERVAL_MEDIUM || fallbackIntervals.MEDIUM,
  ), // 60s
  SLOW: parseInt(process.env.REFRESH_INTERVAL_SLOW || fallbackIntervals.SLOW), // 5m
  VERY_SLOW: parseInt(
    process.env.REFRESH_INTERVAL_VERY_SLOW || fallbackIntervals.VERY_SLOW,
  ), // 1d
})
