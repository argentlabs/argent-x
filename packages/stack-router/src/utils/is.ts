import type { Presentation } from "../types"

export const isModalPresentation = (presentation?: Presentation) => {
  return presentation === "modal" || presentation === "modalSheet"
}

export const isStackedPresentation = (presentation?: Presentation) => {
  return presentation === "stacked" || presentation === "stackedStacked"
}

export const isModalSheetPresentation = (presentation?: Presentation) => {
  return presentation === "modalSheet" || presentation === "pushModalSheet"
}
