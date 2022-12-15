import { Presentation } from "./types"

export const isModalPresentation = (presentation?: Presentation) => {
  return presentation === "modal" || presentation === "modalSheet"
}

export const isStackedPresentation = (presentation?: Presentation) => {
  return presentation === "stacked" || presentation === "stackedStacked"
}

export const isDefaultPresentation = (presentation?: Presentation) => {
  return presentation === "default"
}
