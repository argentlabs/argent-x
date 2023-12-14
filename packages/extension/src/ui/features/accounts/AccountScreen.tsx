import { SupportedNetworks, SwapProvider } from "@argent/x-swap"
import { FC, ReactNode, useMemo } from "react"

import { getMulticallForNetwork } from "../../../shared/multicall"
import { AccountActivityContainer } from "../accountActivity/AccountActivityContainer"
import { AccountCollectionsContainer } from "../accountNfts/AccountCollectionsContainer"
import { AccountTokensContainer } from "../accountTokens/AccountTokensContainer"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { NoSwap } from "../swap/NoSwap"
import { Swap } from "../swap/Swap"
import { AccountContainer } from "./AccountContainer"
import { useAccount } from "./accounts.state"
import { AccountScreenEmptyContainer } from "./AccountScreenEmptyContainer"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"

interface AccountScreenProps {
  tab: "tokens" | "collections" | "activity" | "swap"
}

/** TODO: refactor: rename 'RootContainer' or similar */

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const walletAccount = useView(selectedAccountView)
  const account = useAccount(walletAccount)
  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()

  const hasAccount = account !== undefined

  const multicall = account && getMulticallForNetwork(account?.network)

  const noSwap = useMemo(
    () =>
      ![SupportedNetworks.MAINNET, SupportedNetworks.TESTNET].includes(
        account?.networkId as any,
      ),
    [account?.networkId],
  )

  if (shouldShowFullScreenStatusMessage) {
    return <StatusMessageFullScreenContainer />
  }

  let body: ReactNode
  if (!hasAccount) {
    body = <AccountScreenEmptyContainer />
  } else if (tab === "tokens") {
    body = <AccountTokensContainer account={account} />
  } else if (tab === "collections") {
    body = <AccountCollectionsContainer account={account} />
  } else if (tab === "activity") {
    body = <AccountActivityContainer account={account} />
  } else if (tab === "swap") {
    body = noSwap ? (
      <NoSwap />
    ) : (
      <SwapProvider
        selectedAccount={account}
        multicall={multicall}
        rpcUrl={account.network.rpcUrl}
        chainId={account.network.chainId}
      >
        <Swap />
      </SwapProvider>
    )
  } else {
    tab satisfies never
  }

  const scrollKey = `accounts/account-${tab}`
  return <AccountContainer scrollKey={scrollKey}>{body}</AccountContainer>
}
