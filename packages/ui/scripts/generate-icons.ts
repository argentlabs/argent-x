import fs from "fs"
import path from "path"

import { Config, transform } from "@svgr/core"
import fetch from "cross-fetch"
import * as dotenv from "dotenv"
import { camelCase, upperFirst } from "lodash-es"

dotenv.config()

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN
const FIGMA_ICONS_FILE_KEY = "LHwepHSS4bouYQjbMOZJjW"

type IconsConfig = {
  displayName: string
  figmaNodeId: string
  outputFolder: string
  additionalSvgConfig?: Config
  componentSuffix?: string
}

const ICONS_CONFIG: IconsConfig[] = [
  {
    displayName: "Icons",
    figmaNodeId: decodeURIComponent("2%3A51"),
    additionalSvgConfig: {
      replaceAttrValues: {
        "#fff": "currentColor",
      } /** allows icons to be coloured using current css color */,
    },
    componentSuffix: "icon",
    outputFolder: path.join(__dirname, "../src/components/icons"),
  },
  {
    displayName: "Logos",
    figmaNodeId: decodeURIComponent("150%3A31"),
    outputFolder: path.join(__dirname, "../src/components/logos"),
  },
]

if (!FIGMA_ACCESS_TOKEN) {
  throw "process.env.FIGMA_ACCESS_TOKEN is not defined - you can get a token from https://www.figma.com/developers/api#access-tokens"
}

/** sparse types for Figma API */

type Components = Record<
  string,
  {
    key: string
    name: string
    description: string
    componentSetId?: string
    documentationLinks: string[]
  }
>

type ComponentSet = Record<
  string,
  {
    key: string
    name: string
    description: string
  }
>

type IconsNode = {
  document: any /** we don't care about this currently */
  components: Components
  componentSets: ComponentSet
}

type ImageResponse = {
  err: null | string
  images: Record<string, string>
}

/** pass a raw svg text through svgr and return tsx component source code */

const svgCodeToIconComponentCode = async (
  svgCode: string,
  additionalSvgConfig?: Config,
) => {
  return transform(svgCode, {
    typescript: true,
    icon: true,
    jsxRuntime: "automatic",
    plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx", "@svgr/plugin-prettier"],
    ...additionalSvgConfig,
  })
}

/**
 * svgr with `icon=true` forces `height="1em"` and `width="1em"` regardless of proportions.
 * This function parses the SVG `viewBox` and computes `width=`
 * with an expected proportional em value
 */

const fixIconComponentCodeEmWidth = (iconComponentCode: string) => {
  const viewBoxRegEx = /viewBox="(.+)"/
  const matches = iconComponentCode.match(viewBoxRegEx)
  if (!matches) {
    return iconComponentCode
  }
  const viewBox = matches[1]
  const [, , width, height] = viewBox.split(" ").map(parseFloat)
  const widthEm = width / height
  const widthRegEx = /width="(.+)"/
  const fixedIconComponentCode = iconComponentCode.replace(
    widthRegEx,
    `width="${widthEm}em"`,
  )
  return fixedIconComponentCode
}

/** wrap the SVG with Chakra component factory so can use chakra props directly */

const convertToChakraSvg = (iconComponentCode: string) => {
  iconComponentCode = iconComponentCode.replace(
    "export default SvgComponent",
    "export default chakra(SvgComponent)",
  )
  return `import { chakra } from "@chakra-ui/react"
${iconComponentCode}`
}

/** Figma API fetcher which sets the `X-Figma-Token` header */

const fetcher = async (url: string, raw = false) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Figma-Token": FIGMA_ACCESS_TOKEN,
    },
  })
  if (raw) {
    return response
  }
  const json = await response.json()
  return json
}

/** fetch a description of the icon board  which contains the icon ids and names */

const getIconNodesAndNames = async (config: IconsConfig) => {
  const { figmaNodeId, componentSuffix } = config
  const json = await fetcher(
    `https://api.figma.com/v1/files/${FIGMA_ICONS_FILE_KEY}/nodes?ids=${encodeURIComponent(
      figmaNodeId,
    )}`,
  )
  const iconsNode = Object.values(json.nodes)[0] as IconsNode
  const { components, componentSets } = iconsNode
  const nodesAndNames: Record<string, string> = {}
  Object.entries(components).forEach(([id, component]) => {
    const componentName = component.name
    let componentNameElements: string[] = [componentName]
    if (component.componentSetId) {
      const componentSet = componentSets[component.componentSetId]
      // maybe a variant such as Direction=down, just keep the part after =
      const variantSeparatorIndex = componentName.indexOf("=")
      if (variantSeparatorIndex) {
        const variantName = componentName.substring(variantSeparatorIndex + 1)
        componentNameElements = [componentSet.name, variantName]
      } else {
        componentNameElements = [componentSet.name, componentName]
      }
    }
    if (componentSuffix) {
      componentNameElements.push(componentSuffix)
    }
    nodesAndNames[id] = componentNameElements.join("-")
  })
  return nodesAndNames
}

/** use the icon ids and names to fetch SVG URLs, then download each SVG and pass through svgr */

const generateIconsWithConfig = async (config: IconsConfig) => {
  const { displayName, additionalSvgConfig, outputFolder } = config
  console.log(`Cleaning ${displayName} output folder ${outputFolder}`)
  cleanOutputFolder(outputFolder)
  const lines = ["/** This file is auto-generated by `yarn gen:icons` */", ""]
  console.log(`Fetching Figma ${displayName} artboard…`)
  const nodesAndNames = await getIconNodesAndNames(config)
  const ids = Object.keys(nodesAndNames)
  const count = ids.length
  console.log(`Fetching ${count} ${displayName} SVG urls…`)
  const json: ImageResponse = await fetcher(
    `https://api.figma.com/v1/images/${FIGMA_ICONS_FILE_KEY}/?ids=${encodeURIComponent(
      ids.join(","),
    )}&format=svg`,
  )
  let index = 1
  for (const [id, url] of Object.entries(json.images)) {
    const name = nodesAndNames[id]
    const componentName = upperFirst(camelCase(name))
    console.log(
      `${index}/${count} Downloading SVG and creating component ${componentName}…`,
    )
    const reponse = await fetcher(url, true)
    const svgCode = await reponse.text()
    const componentCode = await svgCodeToIconComponentCode(
      svgCode,
      additionalSvgConfig,
    )
    const fileContents = convertToChakraSvg(
      fixIconComponentCodeEmWidth(componentCode),
    )
    const componentFileName = path.join(outputFolder, `${componentName}.tsx`)
    fs.writeFileSync(componentFileName, fileContents, "utf8")
    lines.push(
      `export { default as ${componentName} } from "./${componentName}"`,
    )
    index++
  }
  lines.push("")
  const fileContents = lines.join("\n")
  const indexFileName = path.join(outputFolder, `index.ts`)
  fs.writeFileSync(indexFileName, fileContents, "utf8")
  console.log("Done")
}

const generateIcons = async () => {
  for (const config of ICONS_CONFIG) {
    await generateIconsWithConfig(config)
  }
}

const cleanOutputFolder = (outputFolder: string) => {
  const files = fs.readdirSync(outputFolder)
  for (const file of files) {
    const filePath = path.join(outputFolder, file)
    fs.unlinkSync(filePath)
  }
}

;(async () => {
  await generateIcons()
})()
