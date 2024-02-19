export const pluralise = (value: number, unit: string) => {
  return `${value} ${unit}${value === 1 ? "" : "s"}`
}
