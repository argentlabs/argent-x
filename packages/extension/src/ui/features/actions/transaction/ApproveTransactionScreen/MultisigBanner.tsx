import { P4, SplitProgress, icons } from "@argent/ui"
import { Box, Flex, Progress } from "@chakra-ui/react"

import { Account } from "../../../accounts/Account"
import { useMultisigInfo } from "../../../multisig/hooks/useMultisigInfo"

const { MultisigIcon, ChevronRightIcon } = icons
export const MultisigBanner = ({
  confirmations = 0,
  account,
}: {
  confirmations?: number
  account: Account
}) => {
  const { multisig } = useMultisigInfo(account)
  return (
    <Box backgroundColor="neutrals.700" p={3} borderRadius="lg">
      <Flex justifyContent="space-between">
        <Flex alignItems="center">
          <MultisigIcon color="white" mr={1} />
          <P4 color="white" fontWeight="bold">
            Confirmations: {confirmations}
          </P4>
        </Flex>
        <Flex alignItems="center">
          {multisig?.threshold && (
            <P4 color="neutrals.400">
              {multisig.threshold - confirmations} more required
            </P4>
          )}
          <ChevronRightIcon color="neutrals.400" ml={1} />
        </Flex>
      </Flex>
      {multisig?.threshold && multisig?.threshold > 10 ? (
        <Progress
          max={multisig.threshold}
          value={confirmations}
          size="xs"
          mt={3}
          borderRadius="lg"
        />
      ) : (
        <SplitProgress max={10} value={2} />
      )}
    </Box>
  )
}
