import { Props } from "./variants"

export const variantPropsMatchesComponentProps = (
  variantProps: Props | Props[],
  componentProps: Props,
) => {
  const variantPropsArray = Array.isArray(variantProps)
    ? variantProps
    : [variantProps]
  for (const variantPropsToMatch of variantPropsArray) {
    let matches = true
    for (const [key, value] of Object.entries(variantPropsToMatch)) {
      if (componentProps[key] !== value) {
        matches = false
        break
      }
    }
    if (matches) {
      return true
    }
  }
  return false
}
