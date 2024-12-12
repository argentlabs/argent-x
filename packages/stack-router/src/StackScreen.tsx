import { usePresence, useReducedMotionConfig } from "framer-motion"
import type { FC, PropsWithChildren } from "react"
import { useEffect, useMemo, useRef } from "react"

import {
  animatedTransition,
  replaceTransition,
} from "./presentation/transitions"
import { useStackContext } from "./StackContext"
import type { StackScreenContainerProps } from "./StackScreenContainer"
import { StackScreenMotionContainer } from "./StackScreenContainer"
import { PresentationDirection } from "./types"
import { isModalSheetPresentation, isStackedPresentation } from "./utils/is"

export interface StackScreenProps
  extends PropsWithChildren<StackScreenContainerProps> {
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

  /** honour user accessiblity setting, allowing override via <MotionConfig reducedMotion="..."> */
  const prefersReducedMotion = useReducedMotionConfig()

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

  /** clicking outside modalSheet navigates back in stack */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isPresent && !ref.current?.contains(e.target as Node)) {
        e.stopPropagation()
        onStackClicked()
      }
    }

    if (isModalSheet) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      if (isModalSheet) {
        document.removeEventListener("mousedown", handleClickOutside)
      }
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
    <StackScreenMotionContainer
      ref={ref}
      transition={transition}
      initial={enter}
      animate={active}
      exit={exit}
      zIndex={zIndex}
      {...rest}
    >
      {children}
    </StackScreenMotionContainer>
  )
}
