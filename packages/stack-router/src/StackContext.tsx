import { Action as NavigationType } from "history"
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react"
import { useLocation, useNavigate, useNavigationType } from "react-router-dom"

import { getMatchingPath } from "./getMatchingPath"
import { getPresentationByPathname } from "./getPresentationByPathname"
import {
  Presentation,
  PresentationByPathname,
  PresentationDirection,
  ScreenProps,
} from "./types"

interface StackContextProps {
  presentationDirection: PresentationDirection
  presentationByPathname: PresentationByPathname
  onStackClicked: (path: string) => void
}

const StackContext = createContext<StackContextProps | null>(null)

export const useStackContext = () =>
  useContext(StackContext) as StackContextProps

interface StackContextProviderProps extends PropsWithChildren {
  declaredPresentationByPath: Record<string, Presentation>
}

export const StackContextProvider: FC<StackContextProviderProps> = ({
  declaredPresentationByPath,
  children,
}) => {
  const navigationType = useNavigationType()
  const currentLocation = useLocation()
  const navigate = useNavigate()

  /**
   * Keep track of screens to determine transitions between them
   *
   * Note that NavigationType does not indicate if a screen is added or removed
   *
   * Makes use of the history `key` prop {@link https://github.com/remix-run/history/blob/main/docs/api-reference.md#locationkey}
   * to determine if a screen already exists in the stack
   *
   */

  const screens = useRef<ScreenProps[]>([])
  const poppedScreen = useRef<ScreenProps | null>(null)
  const presentationDirection = useRef(PresentationDirection.Replace)

  const presentationByPathname = useMemo(() => {
    /** makes {@link ScreenProps} with presentation declared in `<Route ... />` or default */
    const screenForCurrentLocation = (): ScreenProps => {
      const declaredPaths = Object.keys(declaredPresentationByPath)
      const matchingPath = getMatchingPath(
        currentLocation.pathname,
        declaredPaths,
      )
      const presentation = matchingPath
        ? declaredPresentationByPath[matchingPath]
        : "default"
      const { pathname, key } = currentLocation
      return {
        pathname,
        key,
        presentation,
      }
    }

    /** get existing screen by matching the key */
    const existingScreen = screens.current.find(
      (screen) => screen.key === currentLocation.key,
    )

    /** update the screens */
    if (!existingScreen) {
      /** add this screen to the stack */
      if (navigationType === NavigationType.Replace) {
        presentationDirection.current = PresentationDirection.Replace
        poppedScreen.current = null
        /** replace the last screen with this one */
        const screen = screenForCurrentLocation()
        screens.current[screens.current.length - 1] = screen
      } else {
        /** NavigationType.Push and NavigationType.Pop can both add screens */
        if (currentLocation.key !== "default") {
          presentationDirection.current = PresentationDirection.Forwards
        }
        poppedScreen.current = null
        /** add the new screen */
        const screen = screenForCurrentLocation()
        screens.current = screens.current.concat(screen)
      }
    } else {
      /** potentailly remove existing screen from the stack */
      if (navigationType === NavigationType.Pop) {
        /** NavigationType.Pop fires for all browser events, so extra checks */
        /** remove top screen only if the current one is next to last */
        if (
          screens.current.indexOf(existingScreen) ===
          screens.current.length - 2
        ) {
          /** pop */
          presentationDirection.current = PresentationDirection.Backwards
          /** pop last screen */
          poppedScreen.current = screens.current[screens.current.length - 1]
          /** remove last screen from stack */
          screens.current = screens.current.slice(0, screens.current.length - 1)
        }
      }
    }

    const presentationByPathname = getPresentationByPathname({
      presentationDirection: presentationDirection.current,
      poppedScreen: poppedScreen.current,
      screens: screens.current,
    })
    return presentationByPathname
  }, [currentLocation, declaredPresentationByPath, navigationType])

  const onStackClicked = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <StackContext.Provider
      value={{
        presentationDirection: presentationDirection.current,
        presentationByPathname,
        onStackClicked,
      }}
    >
      {children}
    </StackContext.Provider>
  )
}
