import { Box, Circle } from "@chakra-ui/react"

import { FC } from "react"
import { Panel } from "../layout/Panel"
import { iconsDeprecated } from "@argent/x-ui"

const { TickIcon } = iconsDeprecated

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
            <TickIcon w="12" h="12" color="success.500" />
          </Circle>
        </Panel>
      )}
    </Box>
  )
}
