export const isFeatureEnabled = (feature: string | undefined): boolean => {
  return (feature || "false") === "true"
}
