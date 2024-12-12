import { isNumber } from "lodash-es"
import { useCallback } from "react"
import type { NavigateOptions, To } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import { useReturnTo } from "./useRoute"

/** navigate using returnTo if set, or fallback */

export const useNavigateReturnToOr = (
  fallback: To | number,
  options?: NavigateOptions,
) => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const navigateReturnToOr = useCallback(() => {
    if (returnTo) {
      navigate(returnTo, options)
    } else {
      if (isNumber(fallback)) {
        navigate(fallback)
      } else {
        navigate(fallback, options)
      }
    }
  }, [navigate, options, returnTo, fallback])
  return navigateReturnToOr
}

export const useNavigateReturnTo = (options?: NavigateOptions) => {
  return useNavigateReturnToOr(-1, options)
}

export const useNavigateReturnToOrBack = useNavigateReturnTo
