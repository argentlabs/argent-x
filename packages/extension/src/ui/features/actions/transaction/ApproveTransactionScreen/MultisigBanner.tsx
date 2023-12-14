import { P4, SplitProgress, icons } from "@argent/ui"
import { Box, Flex, Progress } from "@chakra-ui/react"

import { WalletAccount } from "../../../../../shared/wallet.model"
import { useMultisig } from "../../../multisig/multisig.state"

const { MultisigIcon, ChevronRightIcon } = icons

export interface MultisigBannerProps {
  confirmations?: number
  account: WalletAccount
  onClick?: () => void
}

export const MultisigBanner = ({
  confirmations = 0,
  account,
  onClick,
}: MultisigBannerProps) => {
  const multisig = useMultisig(account)

  return (
    <Box
      backgroundColor="surface.elevated"
      p={3}
      borderRadius="lg"
      _hover={
        onClick
          ? {
              cursor: "pointer",
              backgroundColor: "surface.elevated.hover",
            }
          : {}
      }
      onClick={onClick}
    >
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
              {multisig.threshold - confirmations > 0
                ? multisig.threshold - confirmations
                : 0}{" "}
              more required
            </P4>
          )}
          {onClick ? (
            <ChevronRightIcon color="neutrals.400" ml={1} />
          ) : (
            <Box ml={0.5} />
          )}
        </Flex>
      </Flex>
      {multisig?.threshold &&
        (multisig?.threshold > 10 ? (
          <Progress
            max={multisig.threshold}
            value={confirmations}
            size="xs"
            mt={3}
            borderRadius="lg"
          />
        ) : (
          <SplitProgress max={multisig.threshold} value={confirmations} />
        ))}
    </Box>
  )
}
