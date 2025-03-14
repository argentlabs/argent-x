import { RefreshPrimaryIcon } from "@argent/x-ui/icons"
import { IconButton } from "@argent/x-ui"
import type { TextProps } from "@chakra-ui/react"
import { Text } from "@chakra-ui/react"
import type { FC } from "react"
import {
  createAccountTypeSchema,
  type WalletAccountType,
} from "../../../shared/wallet.model"
import { useOnLedgerStart } from "../ledger/hooks/useOnLedgerStart"

export interface LedgerStatusTextProps extends TextProps {
  isConnected?: boolean
}

export const LedgerStatusText: FC<LedgerStatusTextProps> = ({
  isConnected,
  ...rest
}) => {
  if (isConnected) {
    return (
      <Text color="text-success" {...rest}>
        {"\u23FA"} Ledger connected
      </Text>
    )
  }
  return (
    <Text color="text-secondary" {...rest}>
      {"\u23FA"} Ledger not connected
    </Text>
  )
}

export interface LedgerStatusTextWithReconnectProps extends TextProps {
  isConnected?: boolean
  accountType: WalletAccountType
  networkId: string
}

export const LedgerStatusTextWithReconnect: FC<
  LedgerStatusTextWithReconnectProps
> = ({ isConnected, accountType, networkId, ...rest }) => {
  const onLedgerStart = useOnLedgerStart(
    createAccountTypeSchema.parse(accountType),
  )
  const onReconnect = () => onLedgerStart("reconnect", networkId)

  if (isConnected) {
    return (
      <Text color="text-success" {...rest}>
        {"\u23FA"} Ledger connected
      </Text>
    )
  }

  return (
    <Text color="text-secondary" position="relative" {...rest}>
      {"\u23FA"} Ledger not connected
      <IconButton
        size="3xs"
        icon={<RefreshPrimaryIcon color="text-secondary" fontSize="smaller" />}
        onClick={onReconnect}
        p={0}
        minH={0}
        position="absolute"
        right="-16px"
        top="50%"
        transform="translateY(-45%)"
      />
    </Text>
  )
}
