import { matchPath } from "react-router-dom"

export const normalizePath = (path: string) => {
  const suffix = path.split("/").filter(Boolean).join("/")
  return `/${suffix}`
}

export const depthOfPath = (path: string) => {
  return normalizePath(path).split("/").filter(Boolean).length
}

export const getParentPath = (path: string) => {
  const elements = path.split("/").filter(Boolean)
  elements.pop()
  return normalizePath(elements.join("/"))
}

export const areSiblingPaths = (a: string, b: string) => {
  const elementsA = normalizePath(a).split("/").filter(Boolean)
  const elementsB = normalizePath(b).split("/").filter(Boolean)
  if (elementsA.length === elementsB.length) {
    elementsA.pop()
    elementsB.pop()
    return elementsA.every((element, index) => {
      if (element === elementsB[index]) {
        return true
      }
      return false
    })
  }
  return false
}

export const isDirectChildOfParentPath = (
  path?: string,
  parentPath?: string,
) => {
  if (!path || !parentPath) {
    return false
  }
  return getParentPath(parentPath) === normalizePath(path)
}

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
