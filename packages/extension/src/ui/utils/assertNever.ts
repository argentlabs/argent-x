export const assertNever = (_: never): never => {
  throw new Error("never")
}
