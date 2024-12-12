import { L2Bold, P1 } from "@argent/x-ui"
import { Box, Flex } from "@chakra-ui/react"
import type { FC } from "react"

export const LedgerConnectionError: FC<{ error: string }> = ({ error }) => {
  return (
    <Flex gap="8" direction="column">
      <P1 color="neutrals.200">
        Please make sure your Ledger is unlocked and the Starknet app is opened
      </P1>
      <Box
        px={2.5}
        py={3}
        bgColor="primary.red.1000"
        color="primary.red.400"
        width="max-content"
        borderRadius="12px"
      >
        <L2Bold>LedgerError: {error}</L2Bold>
      </Box>
    </Flex>
  )
}
