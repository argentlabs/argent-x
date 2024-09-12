import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react"
import {
  Location,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom"

import { getPresentationByPath } from "./presentation/getPresentationByPath"
import { updateScreenStack } from "./presentation/screenStack"
import { useStackRoutesConfig } from "./StackRoutesConfig"
import {
  DeclaredPresentationByPath,
  PresentationByPath,
  PresentationDirection,
  ScreenProps,
} from "./types"
import { isModalPresentation } from "./utils/is"

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

/** Basic screen stack state persistence between component re-mounts */
let _persistScreens: ScreenProps[] = []

export const StackContextProvider: FC<StackContextProviderProps> = ({
  declaredPresentationByPath,
  paths,
  children,
}) => {
  const navigationType = useNavigationType()
  const currentLocation = useLocation()
  const navigate = useNavigate()
  const stackRoutesConfig = useStackRoutesConfig()

  const screens = useRef<ScreenProps[]>([])
  const poppedScreens = useRef<ScreenProps[]>([])
  const presentationDirection = useRef(PresentationDirection.Replace)
  const lastHandledLocation = useRef<Location | null>(null)

  useEffect(() => {
    return () => {
      /** store screen state in case we are re-mounted */
      _persistScreens = [...screens.current]
    }
  }, [])

  const presentationByPath = useMemo(() => {
    /** only run once for same location in dev */
    if (lastHandledLocation.current !== currentLocation) {
      if (lastHandledLocation.current === null) {
        if (_persistScreens.length) {
          const lastScreen = _persistScreens[_persistScreens.length - 1]
          if (lastScreen.key === currentLocation.key) {
            /** we were re-mounted with same history key, restore state */
            screens.current = [..._persistScreens]
          }
        }
      }

      lastHandledLocation.current = currentLocation

      const updatedStack = updateScreenStack({
        screens: screens.current,
        navigationType,
        currentLocation,
        declaredPresentationByPath,
        paths,
        defaultPresentation: stackRoutesConfig?.defaultPresentation,
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
  }, [
    currentLocation,
    declaredPresentationByPath,
    navigationType,
    paths,
    stackRoutesConfig?.defaultPresentation,
  ])

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
