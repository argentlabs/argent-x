import type { FC } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import {
  usePrettyBalanceForAccount,
  usePrettyBalanceForNetwork,
} from "./usePrettyBalance"
import { useNetwork } from "../networks/hooks/useNetwork"
import { prettifyCurrencyValue } from "@argent/x-shared"

interface PrettyBalanceForAccountProps {
  account: WalletAccount
}

export const PrettyBalanceOrNameForAccount: FC<
  PrettyBalanceForAccountProps
> = ({ account }) => {
  const prettyAccountBalance = usePrettyBalanceForAccount(account)
  return <>{prettyAccountBalance || account.name}</>
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

export const PrettyBalanceOrNameForNetwork: FC<
  PrettyBalanceForNetworkProps
> = ({ networkId }) => {
  const network = useNetwork(networkId)
  const prettyNetworkBalance = usePrettyBalanceForNetwork(networkId)
  return <>{prettyNetworkBalance || network.name}</>
}

/**
 * FIXME: usePrettyBalanceForNetwork hook is heavy and slow
 * As a workaround, this component can be wrapped in Suspense for more performant UI
 */
export const PrettyBalanceForNetwork: FC<PrettyBalanceForNetworkProps> = ({
  networkId,
}) => {
  const prettyNetworkBalance = usePrettyBalanceForNetwork(networkId)
  return <>{prettyNetworkBalance || prettifyCurrencyValue(0)}</>
}
