export const makeClickable = (handler?: () => void, tabIndex = 0) => ({
  tabIndex,
  onClick: handler,
  onKeyUp: (e: any) => {
    if (e.keyCode === 13) {
      handler?.()
    }
  },
})
