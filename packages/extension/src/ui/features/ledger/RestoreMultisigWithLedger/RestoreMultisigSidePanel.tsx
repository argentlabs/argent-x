import { Box, Circle } from "@chakra-ui/react"

import type { FC } from "react"
import { Panel } from "../layout/Panel"
import { icons } from "@argent/x-ui"

const { CheckmarkSecondaryIcon } = icons

export const RestoreMultisigSidePanel: FC<{ found?: boolean }> = ({
  found = false,
}) => {
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
      {found && (
        <Panel>
          <Circle size="24" bg="success.900">
            <CheckmarkSecondaryIcon w="12" h="12" color="success.500" />
          </Circle>
        </Panel>
      )}
    </Box>
  )
}
