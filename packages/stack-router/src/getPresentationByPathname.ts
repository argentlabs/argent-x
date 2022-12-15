import { isModalPresentation } from "./is"
import { variantForPresentation } from "./presentationVariants"
import { ScreenProps } from "./types"
import {
  Presentation,
  PresentationByPathname,
  PresentationDirection,
} from "./types"

interface GetPresentationByPathnameProps {
  presentationDirection: PresentationDirection
  poppedScreen: ScreenProps | null
  screens: ScreenProps[]
}

export const getPresentationByPathname = ({
  presentationDirection,
  poppedScreen,
  screens,
}: GetPresentationByPathnameProps) => {
  const result: PresentationByPathname = {}
  const screensWithPopped = poppedScreen ? [...screens, poppedScreen] : screens
  const isForwards = presentationDirection === PresentationDirection.Forwards
  for (let i = 0; i < screensWithPopped.length; i++) {
    const screen = screensWithPopped[i]
    const screensAboveWithPopped = screensWithPopped.slice(i + 1)

    /** exclude the popped screen when navigating back */
    const screensAbove = isForwards
      ? screensWithPopped.slice(i + 1)
      : screens.slice(i + 1)
    const screensBelow = i > 0 ? screens.slice(0, i) : []

    /** count modal screens above this one to determine 'stacked' appearance */
    const modalsAbove = screensAbove.filter((screenAbove) =>
      isModalPresentation(screenAbove.presentation),
    ).length

    /** determine if default on top of a modalSheet - should animate like default, but modal sheet height - defaultModalSheet */
    const isAboveModalSheet =
      screensBelow.filter((screen) => screen.presentation !== "default").pop()
        ?.presentation === "modalSheet"

    const isDefaultAboveModalSheet =
      isAboveModalSheet && screen.presentation === "default"

    /** determine if modalSheet beneath default - should animate like default */
    const isModalSheetBeneathDefault =
      screen.presentation === "modalSheet" &&
      screensAboveWithPopped[0]?.presentation === "default"

    /** determine if modal beneath default - should animate like default  */
    const isModalBeneathDefault =
      screen.presentation === "modal" &&
      screensAboveWithPopped[0]?.presentation === "default"

    /** determine stacked order before modal overrides */
    const presentation: Presentation =
      modalsAbove > 1
        ? "stackedStacked"
        : modalsAbove === 1
        ? "stacked"
        : isModalSheetBeneathDefault || isDefaultAboveModalSheet
        ? "defaultModalSheet"
        : isModalBeneathDefault
        ? "default"
        : screen.presentation

    const variant = variantForPresentation(presentation, !isForwards)
    result[screen.pathname] = {
      variant,
      presentation,
      zIndex: i,
    }
  }
  return result
}
