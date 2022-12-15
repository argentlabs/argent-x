import { Action as NavigationType } from "history"
import { Location } from "react-router-dom"

import { getMatchingPath } from "./getMatchingPath"
import { Presentation, PresentationDirection, ScreenProps } from "./types"

interface UpdateScreenStackProps {
  navigationType: NavigationType
  currentLocation: Location
  screens: ScreenProps[]
  declaredPresentationByPath: Record<string, Presentation>
  paths: string[]
}

/**
 * Keep track of screens to determine transitions between them
 *
 * Note that NavigationType does not indicate if a screen is added or removed
 *
 * Makes use of the history `key` prop {@link https://github.com/remix-run/history/blob/main/docs/api-reference.md#locationkey}
 * to determine if a screen already exists in the stack
 *
 */

export const updateScreenStack = ({
  navigationType,
  currentLocation,
  screens,
  declaredPresentationByPath,
  paths,
}: UpdateScreenStackProps) => {
  /** this should always match, but if not then use unknown pathname as fallback */
  const matchingPath =
    getMatchingPath(currentLocation.pathname, paths) || currentLocation.pathname

  let presentationDirection = PresentationDirection.Replace
  let poppedScreens: ScreenProps[] = []
  let updatedScreens = [...screens]

  /** makes {@link ScreenProps} with presentation declared in `<Route ... />` or default */
  const screenForCurrentLocation = (): ScreenProps => {
    const declaredPresentaionPaths = Object.keys(declaredPresentationByPath)
    const matchingPresentationPath = getMatchingPath(
      currentLocation.pathname,
      declaredPresentaionPaths,
    )
    const presentation = matchingPresentationPath
      ? declaredPresentationByPath[matchingPresentationPath]
      : "default"
    const { pathname, key } = currentLocation
    return {
      path: matchingPath,
      pathname,
      key,
      presentation,
    }
  }

  /** get existing screen by matching the key */
  const existingScreen = screens.find(
    (screen) => screen.key === currentLocation.key,
  )

  /** get existing screen index by matching the pathname */
  const existingScreenIndexWithPath = screens.findIndex(
    (screen) => screen.path === matchingPath,
  )

  /** update the screens */
  if (!existingScreen && existingScreenIndexWithPath === -1) {
    /** add this screen to the stack */
    if (navigationType === NavigationType.Replace) {
      presentationDirection = PresentationDirection.Replace
      poppedScreens = []
      /** replace the last screen with this one */
      const screen = screenForCurrentLocation()
      updatedScreens[screens.length - 1] = screen
    } else {
      /** NavigationType.Push and NavigationType.Pop can both add screens */
      if (currentLocation.key !== "default") {
        presentationDirection = PresentationDirection.Forwards
      }
      poppedScreens = []
      /** add the new screen */
      const screen = screenForCurrentLocation()
      updatedScreens = screens.concat(screen)
    }
  } else {
    if (existingScreenIndexWithPath !== -1) {
      /** pop */
      presentationDirection = PresentationDirection.Backwards
      /** pop last screen */
      poppedScreens = screens.slice(existingScreenIndexWithPath + 1)
      /** remove last screen from stack */
      updatedScreens = screens.slice(0, existingScreenIndexWithPath + 1)
      /** replace existing screen record with new one */
      const screen = screenForCurrentLocation()
      updatedScreens[existingScreenIndexWithPath] = screen
    } else if (existingScreen) {
      /** potentailly remove existing screen from the stack */
      if (navigationType === NavigationType.Pop) {
        /** NavigationType.Pop fires for all browser events, so extra checks */
        /** remove top screen only if the current one is next to last */
        if (screens.indexOf(existingScreen) === screens.length - 2) {
          /** pop */
          presentationDirection = PresentationDirection.Backwards
          /** pop last screen */
          poppedScreens = screens.slice(-1)
          /** remove last screen from stack */
          updatedScreens = screens.slice(0, screens.length - 1)
        }
      }
    }
  }

  return {
    screens: updatedScreens,
    poppedScreens,
    presentationDirection,
  }
}
