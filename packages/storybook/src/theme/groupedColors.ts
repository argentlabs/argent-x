import { colors } from "@argent-x/ui/src/theme/theme"
import { upperFirst } from "lodash-es"

const groupedColors: Record<string, Record<string, string>> = {}

Object.entries(colors).map(([key, value]) => {
  const match = key.match(/[a-z]+/)?.[0]
  const title = match ? upperFirst(match) : "Ungrouped"
  if (!groupedColors[title]) {
    groupedColors[title] = {}
  }
  groupedColors[title][key] = value
})

export { groupedColors }
