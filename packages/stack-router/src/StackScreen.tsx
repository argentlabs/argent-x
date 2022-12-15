import { usePresence } from "framer-motion"
import { Transition } from "framer-motion"
import { useReducedMotion } from "framer-motion"
import { ComponentProps, FC, useEffect, useMemo, useRef } from "react"

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
  const {
    presentationDirection,
    presentationByPath: presentationByPath,
    onStackClicked,
  } = useStackContext()
  const [isPresent, safeToRemove] = usePresence()
  const prefersReducedMotion = useReducedMotion()

  const { variant, presentation, zIndex } = presentationByPath[path] || {}
  const { enter, active, exit } = variant || {}
  const isStacked = isStackedPresentation(presentation)
  const isModalSheet =
    presentation === "modalSheet" || presentation === "defaultModalSheet"

  /** stack behind modal-sheet, remove when no longer in stack */
  useEffect(() => {
    if (!isPresent && !isStacked) {
      safeToRemove()
    }
  }, [isPresent, isStacked, safeToRemove])

  /** clicking outside navigates back in stack */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isPresent && !ref.current?.contains(e.target as Node)) {
        e.stopPropagation()
        onStackClicked()
      }
    }

    isModalSheet && document.addEventListener("mousedown", handleClickOutside)

    return () => {
      isModalSheet &&
        document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalSheet, isPresent, onStackClicked])

  const transition = useMemo(() => {
    return prefersReducedMotion ||
      presentationDirection === PresentationDirection.Replace
      ? replaceTransition
      : animatedTransition
  }, [prefersReducedMotion, presentationDirection])

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
