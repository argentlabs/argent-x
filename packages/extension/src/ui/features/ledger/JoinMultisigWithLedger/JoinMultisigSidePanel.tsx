import { Box, Circle } from "@chakra-ui/react"

import type { FC } from "react"
import { Panel } from "../layout/Panel"
import { icons } from "@argent/x-ui"

const { ShareIcon } = icons

export const JoinMultisigSidePanel: FC = () => {
  return (
    <Box
      width={{ md: "31.25%" }}
      display={{ md: "flex" }}
      backgroundColor={{ md: "black" }}
      height={{ md: "100%" }}
      background="black"
      backgroundSize="cover"
      overflow="clip"
      position="relative"
    >
      <Panel>
        <Circle size="24" bg="neutrals.700">
          <ShareIcon w="12" h="12" />
        </Circle>
      </Panel>
    </Box>
  )
}
