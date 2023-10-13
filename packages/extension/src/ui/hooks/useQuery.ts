import { useMemo } from "react"
import { useLocation } from "react-router-dom"

/** hook that builds on useLocation to parse query string */

export const useQuery = () => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}
