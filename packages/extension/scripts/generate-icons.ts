import fetch from "cross-fetch"
import * as dotenv from "dotenv"

dotenv.config()

console.log("here:", process.env.FIGMA_ACCESS_TOKEN)

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
  return Object.entries(components).flatMap(([id, component]) => {
    return {
      id,
      name: component.name,
    }
  })
}

type ImageResponse = {
  err: null | string
  images: Record<string, string>
}

const generateIcons = async () => {
  const iconNodesAndNames = await getIconNodesAndNames()
  console.log(iconNodesAndNames)
  const ids = iconNodesAndNames.map(({ id }) => id)
  const json: ImageResponse = await fetcher(
    `https://api.figma.com/v1/images/${FIGMA_ICONS_FILE_KEY}/?ids=${encodeURIComponent(
      ids.join(","),
    )}&format=svg`,
  )
  for (const [id, url] of Object.entries(json.images)) {
    const reponse = await fetcher(url, true)
    const text = await reponse.text()
    console.log("reponse", text)
  }
  // console.log(JSON.stringify(json))
  // for (const { id, name } of iconNodesAndNames) {
  //   /** request the svg image information for this icon node */
  //   const json: ImageResponse = await fetcher(
  //     `https://api.figma.com/v1/images/${FIGMA_ICONS_FILE_KEY}/?ids=${encodeURIComponent(
  //       id,
  //     )}&format=svg`,
  //   )
  //   console.log(JSON.stringify(json))
  // }
}

;(async () => {
  await generateIcons()
})()
