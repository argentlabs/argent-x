import { Box, chakra } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

import { useExtensionIsInTab } from "../features/browser/tabs"

export const ResponsiveBox = chakra(Box, {
  baseStyle: {
    margin: [0, "0 10%"],
  },
})

export const ResponsiveFixedBox = chakra(Box, {
  baseStyle: {
    position: "fixed",
    left: [0, "10%"],
    right: [0, "10%"],
  },
})

export const AppDimensions: FC<PropsWithChildren> = (props) => {
  const extensionIsInTab = useExtensionIsInTab()
  return (
    <Box
      width={extensionIsInTab ? undefined : "360px"}
      height={extensionIsInTab ? undefined : "600px"}
      {...props}
    />
  )
}
