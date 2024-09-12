export function getPathForIndex(
  index: number,
  baseDerivationPath: string,
): string {
  return `${baseDerivationPath}/${index}`
}

export function getIndexForPath(path: string, baseDerivationPath: string) {
  if (!path.startsWith(baseDerivationPath)) {
    throw new Error("path should begin with baseDerivationPath")
  }
  const index = path.substring(path.lastIndexOf("/") + 1)
  return parseInt(index)
}

export function getNextPathIndex(
  paths: string[],
  baseDerivationPath: string,
): number {
  for (let index = 0; index < paths.length; index++) {
    if (!paths.includes(getPathForIndex(index, baseDerivationPath))) {
      return index
    }
  }
  return paths.length
}
