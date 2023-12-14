/** TODO: add some light tests */

export const exponentialBackoff = (retryCount: number) => {
  /** exponential */
  const delay = (Math.pow(2, retryCount) - 1) * 1000
  /** randomise by +- 10% to smooth aggregate traffic */
  const randomness = 0.9 + Math.random() * 0.2
  const randomisedDelay = delay * randomness
  return randomisedDelay
}
