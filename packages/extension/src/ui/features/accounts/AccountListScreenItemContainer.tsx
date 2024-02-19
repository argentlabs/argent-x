import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import {
  useIsPreauthorized,
  useOriginatingPreAuthorizationHost,
} from "../preAuthorizations/hooks"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { routes } from "../../routes"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { usePrettyAccountBalance } from "../accountTokens/usePrettyAccountBalance"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { Account } from "./Account"
import { AccountListScreenItem } from "./AccountListScreenItem"
import { BoxProps } from "@chakra-ui/react"
import { useIsDeprecatedTxV0 } from "./accountUpgradeCheck"
import { clientAccountService } from "../../services/account"
import { useAccountOwnerIsSelf } from "./useAccountOwner"
import { useStarknetId } from "../../services/useStarknetId"

interface AccountListScreenItemContainerProps
  extends Pick<BoxProps, "borderBottomRadius"> {
  account: Account
  selectedAccount?: BaseWalletAccount
  needsUpgrade?: boolean
  clickNavigateSettings?: boolean
  returnTo?: string
  showRightElements?: boolean
}

export const AccountListScreenItemContainer: FC<
  AccountListScreenItemContainerProps
> = ({
  account,
  selectedAccount,
  needsUpgrade,
  clickNavigateSettings,
  returnTo,
  borderBottomRadius,
  showRightElements,
}) => {
  const prettyAccountBalance = usePrettyAccountBalance(account)
  const navigate = useNavigate()
  const originatingPreAuthorizationHost = useOriginatingPreAuthorizationHost()
  // TODO: should not be needed when data layer was restructered, as all properties can be considered real time at that point.
  const status = useAccountStatus(account, selectedAccount)
  // TODO: waiting for multisig refactor to use views and services
  const multisig = useMultisig(account)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  const accountOwnerIsSelf = useAccountOwnerIsSelf(account)
  const isRemovedFromMultisig = useMemo(() => {
    if (multisig) {
      return !signerIsInMultisig
    }
    return false
  }, [multisig, signerIsInMultisig])

  const isConnected = useIsPreauthorized(
    originatingPreAuthorizationHost,
    account,
  )

  const isDeprecated = useIsDeprecatedTxV0(account)

  const onClick = useCallback(async () => {
    if (clickNavigateSettings) {
      const routeTo = isRemovedFromMultisig
        ? routes.multisigRemovedSettings(account.address)
        : routes.settingsAccount(account.address)

      navigate(routeTo)
    } else {
      await clientAccountService.select(account)

      // For multisig accounts, navigate to the multisig screen if the account is not yet deployed
      // Otherwise, it blocks users as there is no navigation to go back to the tokens screen
      if (account.type === "multisig" && account.needsDeploy) {
        return navigate(routes.accountTokens())
      }

      navigate(returnTo || routes.accountTokens())
    }
  }, [
    account,
    clickNavigateSettings,
    isRemovedFromMultisig,
    navigate,
    returnTo,
  ])

  const { data: starknetId } = useStarknetId(account)

  const accountDescription = isRemovedFromMultisig
    ? "Removed from multisig"
    : starknetId
    ? starknetId
    : undefined

  const accountExtraInfo = multisig
    ? `${multisig.threshold}/${multisig.signers.length}`
    : undefined

  return (
    <AccountListScreenItem
      onClick={() => void onClick()}
      accountName={account.name}
      accountDescription={accountDescription}
      accountAddress={account.address}
      accountExtraInfo={accountExtraInfo}
      networkId={account.networkId}
      accountType={account.type}
      isShield={Boolean(account.guardian)}
      isOwner={accountOwnerIsSelf}
      avatarOutlined={status.code === "CONNECTED"}
      deploying={status.code === "DEPLOYING"}
      upgrade={needsUpgrade}
      connectedHost={isConnected ? originatingPreAuthorizationHost : undefined}
      clickNavigateSettings={clickNavigateSettings}
      isDeprecated={isDeprecated}
      prettyAccountBalance={
        !clickNavigateSettings ? prettyAccountBalance : undefined
      }
      borderBottomRadius={borderBottomRadius}
      showRightElements={showRightElements ?? true}
    />
  )
}
