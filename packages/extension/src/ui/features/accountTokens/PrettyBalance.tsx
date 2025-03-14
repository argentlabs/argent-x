import type { FC } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import {
  usePrettyBalanceForAccount,
  usePrettyBalanceForNetwork,
} from "./usePrettyBalance"
import { Text } from "@chakra-ui/react"

interface PrettyBalanceForAccountProps {
  account: WalletAccount
}

export const PrettyBalanceOrNameForAccount: FC<
  PrettyBalanceForAccountProps
> = ({ account }) => {
  const prettyAccountBalance = usePrettyBalanceForAccount(account)

  if (!prettyAccountBalance) {
    return <Text color="neutrals.500">N/A</Text>
  }

  return <>{prettyAccountBalance}</>
}

/**
 * FIXME: usePrettyAccountBalance hook is heavy and slow
 * As a workaround, this component can be wrapped in Suspense for more performant UI
 */
export const PrettyBalanceForAccount: FC<PrettyBalanceForAccountProps> = ({
  account,
}) => {
  const prettyAccountBalance = usePrettyBalanceForAccount(account)
  return <>{prettyAccountBalance}</>
}

interface PrettyBalanceForNetworkProps {
  networkId: string
}

/**
 * FIXME: usePrettyBalanceForNetwork hook is heavy and slow
 * As a workaround, this component can be wrapped in Suspense for more performant UI
 */
export const PrettyBalanceForNetwork: FC<PrettyBalanceForNetworkProps> = ({
  networkId,
}) => {
  const prettyNetworkBalance = usePrettyBalanceForNetwork(networkId)

  if (!prettyNetworkBalance) {
    return null // Hide Network Balance if it's not available, i.e its not a default network
  }

  return <>{prettyNetworkBalance}</>
}
