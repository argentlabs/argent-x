import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react"
import {
  Location,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom"

import { getPresentationByPath } from "./getPresentationByPath"
import { isModalPresentation } from "./is"
import { updateScreenStack } from "./screenStack"
import {
  DeclaredPresentationByPath,
  PresentationByPath,
  PresentationDirection,
  ScreenProps,
} from "./types"

interface StackContextProps {
  presentationDirection: PresentationDirection
  presentationByPath: PresentationByPath
  onStackClicked: () => void
}

const StackContext = createContext<StackContextProps | null>(null)

export const useStackContext = () =>
  useContext(StackContext) as StackContextProps

interface StackContextProviderProps extends PropsWithChildren {
  declaredPresentationByPath: DeclaredPresentationByPath
  paths: string[]
}

export const StackContextProvider: FC<StackContextProviderProps> = ({
  declaredPresentationByPath,
  paths,
  children,
}) => {
  const navigationType = useNavigationType()
  const currentLocation = useLocation()
  const navigate = useNavigate()

  const screens = useRef<ScreenProps[]>([])
  const poppedScreens = useRef<ScreenProps[]>([])
  const presentationDirection = useRef(PresentationDirection.Replace)
  const lastHandledLocation = useRef<Location | null>(null)

  const presentationByPath = useMemo(() => {
    /** only run once for same location in dev */
    if (lastHandledLocation.current !== currentLocation) {
      lastHandledLocation.current = currentLocation

      const updatedStack = updateScreenStack({
        screens: screens.current,
        navigationType,
        currentLocation,
        declaredPresentationByPath,
        paths,
      })

      screens.current = updatedStack.screens
      poppedScreens.current = updatedStack.poppedScreens
      presentationDirection.current = updatedStack.presentationDirection
    }

    const presentationByPath = getPresentationByPath({
      presentationDirection: presentationDirection.current,
      poppedScreens: poppedScreens.current,
      screens: screens.current,
    })

    return presentationByPath
  }, [currentLocation, declaredPresentationByPath, navigationType, paths])

  const onStackClicked = useCallback(() => {
    const topModal = [...screens.current]
      .reverse()
      .find((poppedScreen) => isModalPresentation(poppedScreen.presentation))
    if (topModal) {
      const topModalIndex = screens.current.indexOf(topModal)
      if (topModalIndex > 0) {
        navigate(screens.current[topModalIndex - 1].pathname)
      }
    }
  }, [navigate])

  return (
    <StackContext.Provider
      value={{
        presentationDirection: presentationDirection.current,
        presentationByPath,
        onStackClicked,
      }}
    >
      {children}
    </StackContext.Provider>
  )
}
