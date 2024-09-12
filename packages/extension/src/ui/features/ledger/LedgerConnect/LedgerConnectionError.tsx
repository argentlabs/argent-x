import { L2, P2 } from "@argent/x-ui"
import { Box, Flex } from "@chakra-ui/react"
import { FC } from "react"

export const LedgerConnectionError: FC<{ error: string }> = ({ error }) => {
  return (
    <Flex gap="8" direction="column">
      <P2 color="neutrals.200">
        Please make sure your Ledger is unlocked and the Starknet app is opened
      </P2>

      <Box
        px={2.5}
        py={3}
        bgColor="primary.red.1000"
        color="primary.red.400"
        width="max-content"
        borderRadius="12px"
      >
        <L2>LedgerError: {error}</L2>
      </Box>
    </Flex>
  )
}
