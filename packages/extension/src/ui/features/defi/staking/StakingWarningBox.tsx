import type { FC } from "react"
import { InfoCircleSecondaryIcon } from "@argent/x-ui/icons"
import { L2 } from "@argent/x-ui"
import { Box, HStack } from "@chakra-ui/react"

export const StakingWarningBox: FC = () => {
  return (
    <Box
      bg="surface-sunken"
      border="1px solid"
      borderColor="stroke-focused"
      p="3"
      borderRadius="lg"
      mt="1"
      mb="1"
      ml="0"
      mr="0"
    >
      <HStack>
        <Box>
          <InfoCircleSecondaryIcon color="icon-secondary" h="4" w="4" />
        </Box>
        <Box>
          <L2 color="text-secondary-web">
            There is a 21 day withdrawal period for unstaking.
          </L2>
        </Box>
      </HStack>
    </Box>
  )
}
