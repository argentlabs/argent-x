/**
 * This is a simple logger for the URL changes, which can be useful for debugging unexpected URL changes
 * Uncommment // debugger statements to break on URL changes
 */

export const setupLocationLogger = () => {
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = ((f) =>
    function pushState(
      this: History,
      ...args: [
        data: any,
        unused: string,
        url?: string | URL | null | undefined,
      ]
    ) {
      // eslint-disable-next-line no-debugger
      // debugger
      const url = args[2]
      console.log("history.pushState url", url)
      return f.apply(this, args)
    })(history.pushState)

  history.replaceState = ((f) =>
    function replaceState(
      this: History,
      ...args: [
        data: any,
        unused: string,
        url?: string | URL | null | undefined,
      ]
    ) {
      // eslint-disable-next-line no-debugger
      // debugger
      const url = args[2]
      console.log("history.replaceState url", url)
      return f.apply(this, args)
    })(history.replaceState)

  return () => {
    history.pushState = originalPushState
    history.replaceState = originalReplaceState
  }
}
