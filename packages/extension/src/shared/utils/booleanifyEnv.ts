export const booleanifyEnv = (
  envVar?: string,
  defaultValue = false,
): boolean => {
  return envVar === "undefined" ? defaultValue : envVar === "true"
}
