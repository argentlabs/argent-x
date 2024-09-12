import { useEffect } from "react"

import { useLegacyLoadingProgress } from "../../app.state"
import { LoadingScreen } from "./LoadingScreen"

export const LoadingScreenContainer = ({
  loadingTexts,
}: {
  loadingTexts?: string[]
}) => {
  const { progress, clearProgress } = useLegacyLoadingProgress()

  // TODO: make clearProgress function stable
  // reset to 'indeterminate' spinner type on unmount
  useEffect(() => () => clearProgress(), []) // eslint-disable-line react-hooks/exhaustive-deps

  return <LoadingScreen progress={progress} loadingTexts={loadingTexts} />
}
