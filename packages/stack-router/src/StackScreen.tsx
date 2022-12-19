import { usePresence } from "framer-motion"
import { useReducedMotion } from "framer-motion"
import { ComponentProps, FC, useEffect, useMemo, useRef } from "react"

import {
  animatedTransition,
  replaceTransition,
} from "./presentation/transitions"
import { useStackContext } from "./StackContext"
import { StackScreenContainer } from "./StackScreenContainer"
import { PresentationDirection } from "./types"
import { isModalSheetPresentation, isStackedPresentation } from "./utils/is"

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
  const isModalSheet = isModalSheetPresentation(presentation)

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
      presentation === "replace" ||
      presentationDirection === PresentationDirection.Replace
      ? replaceTransition
      : animatedTransition
  }, [prefersReducedMotion, presentation, presentationDirection])

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
