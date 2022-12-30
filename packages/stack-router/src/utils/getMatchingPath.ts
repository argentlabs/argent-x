import { matchPath } from "react-router-dom"

export const getMatchingPath = (
  pathToMatch: string | undefined,
  paths: string[],
) => {
  if (!pathToMatch) {
    return
  }
  for (const path of paths) {
    const match = matchPath(path, pathToMatch)
    if (match !== null) {
      return path
    }
  }
}
