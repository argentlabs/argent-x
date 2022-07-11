/**
 * Promise that will resolve after interval milliseconds
 * @param ms - Delay in milliseconds
 * @returns Promise that will resolve after the delay
 */

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
