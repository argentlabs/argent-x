interface MakeClickableOptions {
  label?: string
  tabIndex?: number
}

export const makeClickable = (
  handler?: () => void,
  { label, tabIndex = 0 }: MakeClickableOptions = {},
) => ({
  tabIndex,
  role: "button",
  ...(label ? { "aria-label": label } : {}),
  onClick: handler,
  onKeyUp: (e: any) => {
    if (e.keyCode === 13) {
      handler?.()
    }
  },
})
