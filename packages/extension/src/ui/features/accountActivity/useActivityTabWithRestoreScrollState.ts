import type { Dispatch, SetStateAction } from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

export const useActivityTabWithRestoreScrollState = (
  defaultTabIndex: number,
  scrollStateTabIndex: number,
): [number, Dispatch<SetStateAction<number>>] => {
  const [query, setQuery] = useSearchParams()
  const restoreScrollState = query.get("restoreScrollState")
  const [tabIndex, setTabIndex] = useState(
    restoreScrollState ? scrollStateTabIndex : defaultTabIndex,
  )

  useEffect(() => {
    if (tabIndex !== scrollStateTabIndex && restoreScrollState) {
      const newQuery = new URLSearchParams(query)
      newQuery.delete("restoreScrollState")
      setQuery(newQuery)
    }
  }, [restoreScrollState, setQuery, tabIndex, scrollStateTabIndex, query])

  return [tabIndex, setTabIndex]
}
