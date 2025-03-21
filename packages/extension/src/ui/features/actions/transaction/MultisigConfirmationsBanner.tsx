import {
  MultisigSecondaryIcon,
  ChevronRightSecondaryIcon,
} from "@argent/x-ui/icons"
import { P3, SplitProgress } from "@argent/x-ui"
import { Box, Flex, Progress } from "@chakra-ui/react"

import { useMemo } from "react"
import type { WalletAccount } from "../../../../shared/wallet.model"
import { useView } from "../../../views/implementation/react"
import { multisigView } from "../../multisig/multisig.state"

export interface MultisigConfirmationsBannerProps {
  confirmations?: number
  account: WalletAccount
  onClick?: () => void
}

export const MultisigConfirmationsBanner = ({
  confirmations = 0,
  account,
  onClick,
}: MultisigConfirmationsBannerProps) => {
  const multisig = useView(multisigView(account))

  const hasEnoughConfirmations = useMemo(
    () => multisig?.threshold && multisig?.threshold <= confirmations,
    [confirmations, multisig?.threshold],
  )
  return (
    <Box
      backgroundColor="surface-elevated"
      p={3}
      borderRadius="lg"
      _hover={
        onClick
          ? {
              cursor: "pointer",
              backgroundColor: "surface-elevated-hover",
            }
          : {}
      }
      onClick={onClick}
    >
      <Flex justifyContent="space-between">
        <Flex alignItems="center">
          <MultisigSecondaryIcon color="white" mr={1} />
          <P3 color="white" fontWeight="bold">
            Confirmations: {confirmations}
          </P3>
        </Flex>
        <Flex alignItems="center">
          {multisig?.threshold && (
            <P3 color="neutrals.400">
              {hasEnoughConfirmations
                ? "Confirmed"
                : `${multisig.threshold - confirmations}  more required`}
            </P3>
          )}
          {onClick ? (
            <ChevronRightSecondaryIcon color="neutrals.400" ml={1} />
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
