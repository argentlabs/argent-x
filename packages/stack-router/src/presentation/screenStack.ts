import { Action as NavigationType } from "history"
import { Location } from "react-router-dom"

import { Presentation, PresentationDirection, ScreenProps } from "../types"
import { getMatchingPath, isDirectChildOfParentPath } from "../utils/path"

interface UpdateScreenStackProps {
  navigationType: NavigationType
  currentLocation: Location
  screens: ScreenProps[]
  declaredPresentationByPath: Record<string, Presentation>
  paths: string[]
  defaultPresentation?: Presentation | undefined
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
  defaultPresentation = "push",
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
      : defaultPresentation
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
      poppedScreens = []
      /** replace the last screen if it exists with this one */
      const screen = screenForCurrentLocation()
      updatedScreens[Math.max(0, screens.length - 1)] = screen
    } else {
      if (currentLocation.key !== "default") {
        presentationDirection = PresentationDirection.Forwards
      }

      poppedScreens = []
      /** add the new screen */
      const screen = screenForCurrentLocation()
      /** special check for e.g. deep link into a child page then navigating to its parent */
      const lastScreen = screens.length
        ? screens[screens.length - 1]
        : undefined
      const hasSingleLastScreen = lastScreen && screens.length === 1
      if (
        hasSingleLastScreen &&
        isDirectChildOfParentPath(screen.path, lastScreen.path)
      ) {
        presentationDirection = PresentationDirection.Backwards
        /** pop last screen */
        poppedScreens = [lastScreen]
        /** insert new screen below */
        updatedScreens = [screen, ...screens.slice(0, screens.length - 1)]
      } else {
        /** insert new screen above */
        updatedScreens = screens.concat(screen)
      }
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

  /** always override 'replace' */
  if (navigationType === NavigationType.Replace) {
    presentationDirection = PresentationDirection.Replace
  }

  return {
    screens: updatedScreens,
    poppedScreens,
    presentationDirection,
  }
}
