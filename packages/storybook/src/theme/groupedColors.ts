import { theme } from "@argent/ui"
import { upperFirst } from "lodash-es"

const groupedColors: Record<string, Record<string, string>> = {}

Object.entries(theme.colors).forEach(([key, value]) => {
  if (typeof value === "string") {
    const match = key.match(/[a-z]+/)?.[0]
    const title = match ? upperFirst(match) : "Ungrouped"
    if (!groupedColors[title]) {
      groupedColors[title] = {}
    }
    groupedColors[title][key] = value
  } else {
    groupedColors[key] = value
  }
})

export { groupedColors }
