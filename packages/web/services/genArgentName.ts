// generate random names like "ax-n12dwvzfyw.argent.xyz"
export const generateArgentName = (length: number = 10) => {
  const randomString = Math.random()
    .toString(36)
    .substring(2, length + 2)
  return `ax-${randomString}.argent.xyz`
}
