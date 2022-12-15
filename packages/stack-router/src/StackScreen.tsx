import { usePresence } from "framer-motion"
import { Transition } from "framer-motion"
import { ComponentProps, FC, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

import { isStackedPresentation } from "./is"
import { useStackContext } from "./StackContext"
import { StackScreenContainer } from "./StackScreenContainer"
import { PresentationDirection } from "./types"

export const animatedTransition: Transition = {
  duration: 0.3,
  // duration: 1,
  transition: {
    type: "spring",
    stiffness: 1000,
    damping: 500,
    mass: 3,
    restDelta: 10,
    restSpeed: 10,
  },
}

export const replaceTransition: Transition = {
  duration: 0,
}

export interface StackScreenProps
  extends ComponentProps<typeof StackScreenContainer> {
  /** path specified in `<Route ... />` e.g. `/users/:id` */
  path: string
}

export const StackScreen: FC<StackScreenProps> = ({
  path,
  children,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const { presentationDirection, presentationByPathname, onStackClicked } =
    useStackContext()
  const [isPresent, safeToRemove] = usePresence()
  const currentLocation = useLocation()

  const { variant, presentation, zIndex } =
    presentationByPathname[currentLocation.pathname] || {}
  const { enter, active, exit } = variant || {}
  const isStacked = isStackedPresentation(presentation)

  /** stack behind modal-sheet, remove when no longer in stack */
  useEffect(() => {
    if (!isPresent && !isStacked) {
      safeToRemove()
    }
  }, [isPresent, isStacked, safeToRemove])

  /** when stacked and clicked, could navigate back to this screen */
  useEffect(() => {
    const currentRef = ref?.current
    const onMouseUp = () => {
      onStackClicked(path)
    }
    if (isStacked && currentRef) {
      currentRef.addEventListener("mouseup", onMouseUp)
    }
    return () => {
      if (isStacked && currentRef) {
        currentRef.removeEventListener("mouseup", onMouseUp)
      }
    }
  }, [isStacked, onStackClicked, path])

  const transition =
    presentationDirection === PresentationDirection.Replace
      ? replaceTransition
      : animatedTransition

  return (
    <StackScreenContainer
      ref={ref}
      transition={transition}
      initial={enter}
      animate={active}
      exit={exit}
      zIndex={zIndex}
      {...rest}
    >
      {children}
    </StackScreenContainer>
  )
}
