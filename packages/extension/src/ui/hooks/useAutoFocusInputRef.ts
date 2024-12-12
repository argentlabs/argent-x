import { useEventListener, useIsEventEmitterEnabled } from "@argent/x-ui"
import { useIsPresent } from "framer-motion"
import { useRef } from "react"

import type { AppRoutesEvents } from "./useOnAppRoutesAnimationComplete"
import { AppRoutesAnimationComplete } from "./useOnAppRoutesAnimationComplete"

/**
 * Returns a ref that can be used on an input to give automatic focus once route animation is complete.
 * Falls back to default behaviour and auto-focus immediately if event emitter is not available
 */

export const useAutoFocusInputRef = <T extends HTMLElement>(
  autoFocus = true,
  options?: FocusOptions,
) => {
  const isEventEmitterEnabled = useIsEventEmitterEnabled()
  const isPresent = useIsPresent()
  const eventListener = useEventListener<AppRoutesEvents>()
  const inputRef = useRef<T | null>(null)
  if (autoFocus) {
    if (isEventEmitterEnabled) {
      /** wait for animation completion then focus if still present */
      eventListener(AppRoutesAnimationComplete, () => {
        if (isPresent) {
          inputRef.current?.focus(options)
        }
      })
    } else {
      /** focus immediately */
      setTimeout(() => {
        inputRef.current?.focus(options)
      }, 0)
    }
  }
  return inputRef
}
