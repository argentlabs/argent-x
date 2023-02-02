import { SupportedNetworks, SwapProvider } from "@argent/x-swap"
import { FC, ReactNode, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { getMulticallForNetwork } from "../../../shared/multicall"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { routes } from "../../routes"
import { assertNever } from "../../services/assertNever"
import { AccountActivityContainer } from "../accountActivity/AccountActivityContainer"
import { AccountCollections } from "../accountNfts/AccountCollections"
import { AccountTokens } from "../accountTokens/AccountTokens"
import {
  escapeWarningStore,
  getEscapeWarningStoreKey,
} from "../shield/escape/escapeWarningStore"
import { useAccountsWithEscape } from "../shield/escape/useAccountEscape"
import { StatusMessageFullScreenContainer } from "../statusMessage/StatusMessageFullScreen"
import { useShouldShowFullScreenStatusMessage } from "../statusMessage/useShouldShowFullScreenStatusMessage"
import { NoSwap } from "../swap/NoSwap"
import { Swap } from "../swap/Swap"
import { AccountContainer } from "./AccountContainer"
import { useUpdateAccountsOnChainEscapeState } from "./accounts.service"
import { useSelectedAccount } from "./accounts.state"
import { AccountScreenEmpty } from "./AccountScreenEmpty"
import { useAddAccount } from "./useAddAccount"

interface AccountScreenProps {
  tab: "tokens" | "collections" | "activity" | "swap"
}

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  /** TODO: refactor into a single hook / async fns */
  const navigate = useNavigate()
  useUpdateAccountsOnChainEscapeState()

  const accountsWithEscape = useAccountsWithEscape()
  const escapeWarningKeys = useArrayStorage(escapeWarningStore)
  console.log(JSON.stringify({ escapeWarningKeys }, null, 2))

  const accountWithNewEscape = useMemo(() => {
    return accountsWithEscape.find(
      (account) =>
        !escapeWarningKeys.includes(getEscapeWarningStoreKey(account)),
    )
  }, [escapeWarningKeys, accountsWithEscape])

  useEffect(() => {
    const init = async () => {
      if (accountWithNewEscape) {
        console.log(
          "TODO: navigate to warning about this account and add it to the handled warning keys",
          accountWithNewEscape,
        )
        console.warn("TODO: select the appropriate network and account here")
        navigate(routes.shieldEscapeWarning(accountWithNewEscape.address))
        await escapeWarningStore.push(
          getEscapeWarningStoreKey(accountWithNewEscape),
        )
      }
    }
    init()
  }, [accountWithNewEscape, escapeWarningKeys, navigate])

  const account = useSelectedAccount()
  const shouldShowFullScreenStatusMessage =
    useShouldShowFullScreenStatusMessage()
  const { isAdding } = useAddAccount()

  const hasAcccount = !!account
  const showEmpty = !hasAcccount || (hasAcccount && isAdding)

  const multicall = account && getMulticallForNetwork(account?.network)

  const noSwap = useMemo(
    () =>
      ![SupportedNetworks.MAINNET, SupportedNetworks.TESTNET].includes(
        account?.networkId as any,
      ),
    [account?.networkId],
  )

  let body: ReactNode
  let scrollKey = "accounts/AccountScreen"
  if (showEmpty) {
    return <AccountScreenEmpty />
  } else if (shouldShowFullScreenStatusMessage) {
    return <StatusMessageFullScreenContainer />
  } else if (tab === "tokens") {
    scrollKey = "accounts/AccountTokens"
    body = <AccountTokens account={account} />
  } else if (tab === "collections") {
    scrollKey = "accounts/AccountCollections"
    body = <AccountCollections account={account} />
  } else if (tab === "activity") {
    scrollKey = "accounts/AccountActivityContainer"
    body = <AccountActivityContainer account={account} />
  } else if (tab === "swap") {
    body = noSwap ? (
      <NoSwap />
    ) : (
      <SwapProvider selectedAccount={account} multicall={multicall}>
        <Swap />
      </SwapProvider>
    )
  } else {
    assertNever(tab)
  }

  return <AccountContainer scrollKey={scrollKey}>{body}</AccountContainer>
}
