export const booleanifyEnv = (name: string, defaultValue = false): boolean => {
  const value = process.env[name]
  if (value === undefined) {
    return defaultValue
  }
  return value === "true"
}
