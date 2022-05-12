// behaves like native setInterval but waits for promise to resolve before calling next iteration
export function setIntervalAsync(fn: () => Promise<any>, delay: number) {
  let handle: NodeJS.Timeout | undefined
  const loop = async () => {
    await fn()
    handle = setTimeout(loop, delay)
  }
  handle = setTimeout(loop, delay)
  return () => {
    if (handle) {
      clearTimeout(handle)
    }
  }
}
