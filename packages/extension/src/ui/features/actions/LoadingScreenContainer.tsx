import { FC, useEffect } from "react"

import { useLoadingProgress } from "../../app.state"
import { LoadingScreen } from "./LoadingScreen"

export const LoadingScreenContainer: FC = () => {
  const { progress, clearProgress } = useLoadingProgress()

  // TODO: make clearProgress function stable
  // reset to 'indeterminate' spinner type on unmount
  useEffect(() => () => clearProgress(), []) // eslint-disable-line react-hooks/exhaustive-deps

  return <LoadingScreen progress={progress} />
}
