import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { useIsPreauthorized } from "../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { routes } from "../../routes"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { usePrettyAccountBalance } from "../accountTokens/usePrettyAccountBalance"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { Account } from "./Account"
import { AccountListScreenItem } from "./AccountListScreenItem"
import { BoxProps } from "@chakra-ui/react"
import { useIsDeprecatedTxV0 } from "./accountUpgradeCheck"

interface AccountListScreenItemContainerProps
  extends Pick<BoxProps, "borderBottomRadius"> {
  account: Account
  selectedAccount?: BaseWalletAccount
  needsUpgrade?: boolean
  clickNavigateSettings?: boolean
  returnTo?: string
  shouldDisplayGuardianBanner?: boolean
}

export const AccountListScreenItemContainer: FC<
  AccountListScreenItemContainerProps
> = ({
  account,
  selectedAccount,
  needsUpgrade,
  clickNavigateSettings,
  returnTo,
  shouldDisplayGuardianBanner,
  borderBottomRadius,
}) => {
  const prettyAccountBalance = usePrettyAccountBalance(account)
  const navigate = useNavigate()
  const originatingHost = useOriginatingHost()
  // TODO: should not be needed when data layer was restructered, as all properties can be considered real time at that point.
  const status = useAccountStatus(account, selectedAccount)
  // TODO: waiting for multisig refactor to use views and services
  const multisig = useMultisig(account)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  const isRemovedFromMultisig = useMemo(() => {
    if (multisig) {
      return !signerIsInMultisig
    }
    return false
  }, [multisig, signerIsInMultisig])

  // TBD: this does not look wrong to me, but maybe a good example to think about how it should work
  const isConnected = useIsPreauthorized(originatingHost || "", account)

  const isDeprecated = useIsDeprecatedTxV0(account)

  const onClick = useCallback(async () => {
    if (clickNavigateSettings) {
      const routeTo = isRemovedFromMultisig
        ? routes.multisigRemovedSettings(account.address)
        : routes.editAccount(account.address)

      navigate(routeTo)
    } else {
      await accountService.select(account)

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

  const accountDescription = isRemovedFromMultisig
    ? "Removed from multisig"
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
      avatarOutlined={status.code === "CONNECTED"}
      deploying={status.code === "DEPLOYING"}
      upgrade={needsUpgrade}
      connectedHost={isConnected ? originatingHost : undefined}
      clickNavigateSettings={clickNavigateSettings}
      shouldDisplayGuardianBanner={shouldDisplayGuardianBanner}
      isDeprecated={isDeprecated}
      prettyAccountBalance={
        !clickNavigateSettings ? prettyAccountBalance : undefined
      }
      borderBottomRadius={borderBottomRadius}
    />
  )
}
