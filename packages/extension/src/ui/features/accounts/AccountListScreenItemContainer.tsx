import type { FC } from "react"
import { Suspense, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import type { BoxProps } from "@chakra-ui/react"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { routes } from "../../../shared/ui/routes"
import { clientAccountService } from "../../services/account"
import { useStarknetId } from "../../services/useStarknetId"
import { useIsAccountDeploying } from "../accountTokens/useIsAccountDeploying"
import {
  isSignerInMultisigView,
  multisigView,
} from "../multisig/multisig.state"
import {
  useIsPreauthorized,
  useOriginatingPreAuthorizationHost,
} from "../preAuthorizations/hooks"
import { AccountListScreenItem } from "./AccountListScreenItem"
import { useIsDeprecatedTxV0 } from "./accountUpgradeCheck"
import { useAccountOwnerIsSelf } from "./useAccountOwner"
import { useShowAccountUpgrade } from "../accountTokens/useShowAccountUpgrade"
import { useView } from "../../views/implementation/react"
import { PrettyBalanceForAccount } from "../accountTokens/PrettyBalance"

interface AccountListScreenItemContainerProps
  extends Pick<BoxProps, "borderBottomRadius"> {
  account: WalletAccount
  selectedAccount?: BaseWalletAccount
  clickNavigateSettings?: boolean
  returnTo?: string
  showRightElements?: boolean
}

export const AccountListScreenItemContainer: FC<
  AccountListScreenItemContainerProps
> = ({
  account,
  selectedAccount,
  clickNavigateSettings,
  returnTo,
  borderBottomRadius,
  showRightElements,
}) => {
  const navigate = useNavigate()
  const originatingPreAuthorizationHost = useOriginatingPreAuthorizationHost()
  const isDeploying = useIsAccountDeploying(account)
  // TODO: waiting for multisig refactor to use views and services
  const multisig = useView(multisigView(account))
  const signerIsInMultisig = useView(isSignerInMultisigView(account))
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
        ? routes.multisigRemovedSettings(account.id)
        : routes.settingsAccount(account.id)

      void navigate(routeTo)
    } else {
      await clientAccountService.select(account.id)

      // For multisig accounts, navigate to the multisig screen if the account is not yet deployed
      // Otherwise, it blocks users as there is no navigation to go back to the tokens screen
      if (account.type === "multisig" && account.needsDeploy) {
        return navigate(routes.accountTokens())
      }

      void navigate(returnTo || routes.accountTokens())
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

  const accountNeedsUpgrade = useShowAccountUpgrade(account)

  const prettyAccountBalance = !clickNavigateSettings ? (
    <Suspense>
      <PrettyBalanceForAccount account={account} />
    </Suspense>
  ) : undefined

  return (
    <AccountListScreenItem
      onClick={() => void onClick()}
      accountName={account.name}
      accountDescription={accountDescription}
      accountId={account.id}
      accountAddress={account.address}
      accountExtraInfo={accountExtraInfo}
      avatarMeta={account.avatarMeta}
      networkId={account.networkId}
      accountType={account.type}
      isSmartAccount={Boolean(account.guardian)}
      isOwner={accountOwnerIsSelf}
      avatarOutlined={accountsEqual(account, selectedAccount)}
      deploying={isDeploying}
      upgrade={accountNeedsUpgrade}
      connectedHost={isConnected ? originatingPreAuthorizationHost : undefined}
      clickNavigateSettings={clickNavigateSettings}
      isDeprecated={isDeprecated}
      isLedger={account.signer.type === "ledger"}
      prettyAccountBalance={prettyAccountBalance}
      borderBottomRadius={borderBottomRadius}
      showRightElements={showRightElements ?? true}
    />
  )
}
