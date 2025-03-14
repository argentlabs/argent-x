import { useState, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

/**
 * A hook that manages a tab index based on the URL hash.
 *
 * @param tabHashes - An array of strings representing the tab hashes.
 * @param defaultIndex - The default index to use if the hash is not found.
 * @returns An array containing the current tab index and a function to update it.
 *
 * @example
 * const [tabIndex, setTabIndex] = useTabIndexWithHash(["coins", "nfts", "defi"])
 */
export function useTabIndexWithHash(
  tabHashes: string[],
  defaultIndex: number = 0,
): [number, (newIndex: number) => void] {
  const location = useLocation()
  const navigate = useNavigate()

  // Get the current tab index from the URL hash
  const getIndexFromHash = useCallback((): number => {
    const hash = location.hash.slice(1) // Remove the '#'
    const index = tabHashes.indexOf(hash)
    return index !== -1 ? index : defaultIndex
  }, [location.hash, tabHashes, defaultIndex])

  const [currentIndex, setCurrentIndex] = useState<number>(getIndexFromHash())

  // Update the URL hash when the tab index changes
  const updateIndex = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < tabHashes.length) {
        setCurrentIndex(newIndex)
        const newHash = `#${tabHashes[newIndex]}`
        void navigate(`${location.pathname}${location.search}${newHash}`, {
          replace: true,
        })
      }
    },
    [navigate, location.pathname, location.search, tabHashes],
  )

  // Sync the initial state with the URL hash
  useEffect(() => {
    const indexFromHash = getIndexFromHash()
    if (indexFromHash !== currentIndex) {
      setCurrentIndex(indexFromHash)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount, not on update
  }, [])

  return [currentIndex, updateIndex]
}
