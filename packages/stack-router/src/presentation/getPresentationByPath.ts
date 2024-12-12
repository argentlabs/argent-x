import type { Presentation, PresentationByPath } from "../types"
import { PresentationDirection } from "../types"
import type { ScreenProps } from "../types"
import { isModalPresentation } from "../utils/is"
import { variantForPresentation } from "./presentationVariants"

interface GetPresentationByPathProps {
  presentationDirection: PresentationDirection
  poppedScreens: ScreenProps[]
  screens: ScreenProps[]
}

export const getPresentationByPath = ({
  presentationDirection,
  poppedScreens,
  screens,
}: GetPresentationByPathProps) => {
  const result: PresentationByPath = {}
  const screensWithPopped = poppedScreens
    ? [...screens, ...poppedScreens]
    : screens
  const isForwards = presentationDirection === PresentationDirection.Forwards
  for (let i = 0; i < screensWithPopped.length; i++) {
    const screen = screensWithPopped[i]
    const screensAboveWithPopped = screensWithPopped.slice(i + 1)

    /** exclude the popped screen when navigating back */
    const screensAbove = isForwards
      ? screensWithPopped.slice(i + 1)
      : screens.slice(i + 1)
    const screensBelow = i > 0 ? screens.slice(0, i) : []

    /** count modalSheet screens above this one to determine 'stacked' appearance */
    const modalsSheetsAbove = screensAbove.filter(
      (screenAbove) => screenAbove.presentation === "modalSheet",
    ).length

    /** count modal screens above this one to determine 'modalStacked' appearance */
    const modalsAbove = screensAboveWithPopped.filter(
      (screenAbove) => screenAbove.presentation === "modal",
    ).length

    /** determine if push on top of a modalSheet - should animate like push, but modal sheet height - pushModalSheet */
    const isAboveModalSheet =
      screensBelow.filter((screen) => screen.presentation !== "push").pop()
        ?.presentation === "modalSheet"

    const isPushAboveModalSheet =
      isAboveModalSheet && screen.presentation === "push"

    /** determine if modalSheet beneath default - should animate like default */
    const isModalSheetBeneathPush =
      screen.presentation === "modalSheet" &&
      screensAboveWithPopped[0]?.presentation === "push"

    /** determine if modal beneath default - should animate like default  */
    const isModalBeneathPush =
      screen.presentation === "modal" &&
      screensAboveWithPopped[0]?.presentation === "push"

    const isAboveReplace =
      screensBelow.length > 0 &&
      screensBelow[screensBelow.length - 1].presentation === "replace"

    /** determine stacked order before modal overrides */
    const presentation: Presentation =
      modalsSheetsAbove > 1
        ? "stackedStacked"
        : modalsSheetsAbove === 1
          ? "stacked"
          : modalsAbove > 0
            ? "modalStacked"
            : isModalSheetBeneathPush || isPushAboveModalSheet
              ? "pushModalSheet"
              : isModalBeneathPush
                ? "push"
                : isAboveReplace
                  ? "replace"
                  : screen.presentation

    const variant = variantForPresentation(presentation, !isForwards)
    result[screen.path] = {
      variant,
      presentation,
      zIndex: i,
    }
  }
  /** Special cases when transitioning backwards */
  if (poppedScreens.length) {
    /** If top popped screen presentation is 'replace' then also enforce 'replace' for top screen */
    if (poppedScreens[poppedScreens.length - 1].presentation === "replace") {
      const presentation = "replace"
      const variant = variantForPresentation(presentation, true)
      const screen = screens[screens.length - 1]
      result[screen.path] = {
        ...result[screen.path],
        variant,
        presentation,
      }
    } else {
      /** Ensure popped modal siblings are dismissed with modal or modalSheet presentation */
      let dismissPresentation: Presentation | undefined
      for (const poppedScreen of poppedScreens) {
        /** Encountered a modal, so start enforcing dismissal presentation */
        if (isModalPresentation(poppedScreen.presentation)) {
          dismissPresentation =
            poppedScreen.presentation === "modal" ? "modal" : "modalSheet"
        }
        if (dismissPresentation) {
          const poppedScreenVariant = variantForPresentation(
            dismissPresentation,
            true,
          )
          result[poppedScreen.path] = {
            ...result[poppedScreen.path],
            variant: poppedScreenVariant,
            presentation: dismissPresentation,
          }
        }
      }
    }
  }
  return result
}
