import fs from "fs"
import path from "path"

import fetch from "cross-fetch"
import * as dotenv from "dotenv"

dotenv.config()

const OUTPUT_FOLDER = path.join(
  __dirname,
  "../src/ui/components/Icons/generated",
)

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN
const FIGMA_ICONS_FILE_KEY = "LHwepHSS4bouYQjbMOZJjW"
const FIGMA_ICONS_NODE_ID = decodeURIComponent("0%3A1")

const fetcher = async (url: string, raw = false) => {
  if (!FIGMA_ACCESS_TOKEN) {
    throw "process.env.FIGMA_ACCESS_TOKEN is not defined"
  }
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

type Components = Record<
  string,
  {
    key: string
    name: string
    description: string
    documentationLinks: string[]
  }
>

type IconsNode = {
  document: any /** we don't care about this currently */
  components: Components
}

const getIconNodesAndNames = async () => {
  const json = await fetcher(
    `https://api.figma.com/v1/files/${FIGMA_ICONS_FILE_KEY}/nodes?ids=${encodeURIComponent(
      FIGMA_ICONS_NODE_ID,
    )}`,
  )
  const iconsNode = Object.values(json.nodes)[0] as IconsNode
  const components = iconsNode.components
  const nodesAndNames: Record<string, string> = {}
  Object.entries(components).forEach(([id, component]) => {
    nodesAndNames[id] = component.name
  })
  return nodesAndNames
}

type ImageResponse = {
  err: null | string
  images: Record<string, string>
}

const generateIcons = async () => {
  const nodesAndNames = await getIconNodesAndNames()
  const ids = Object.keys(nodesAndNames)
  const json: ImageResponse = await fetcher(
    `https://api.figma.com/v1/images/${FIGMA_ICONS_FILE_KEY}/?ids=${encodeURIComponent(
      ids.join(","),
    )}&format=svg`,
  )
  for (const [id, url] of Object.entries(json.images)) {
    const reponse = await fetcher(url, true)
    const text = await reponse.text()
    console.log("reponse", text)
    const fileName = path.join(OUTPUT_FOLDER, `${nodesAndNames[id]}.svg`)
    fs.writeFileSync(fileName, text, "utf8")
  }
}

;(async () => {
  await generateIcons()
})()
