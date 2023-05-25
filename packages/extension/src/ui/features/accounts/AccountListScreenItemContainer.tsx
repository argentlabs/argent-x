import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { useIsPreauthorized } from "../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { routes } from "../../routes"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { Account } from "./Account"
import { AccountListScreenItem } from "./AccountListScreenItem"

interface AccountListScreenItemContainerProps {
  account: Account
  selectedAccount?: BaseWalletAccount
  needsUpgrade?: boolean
  clickNavigateSettings?: boolean
  returnTo?: string
}

export const AccountListScreenItemContainer: FC<
  AccountListScreenItemContainerProps
> = ({
  account,
  selectedAccount,
  needsUpgrade,
  clickNavigateSettings,
  returnTo,
}) => {
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

  const onClick = useCallback(async () => {
    await accountService.select(account)
    navigate(returnTo || routes.accountTokens())
  }, [account, navigate, returnTo])

  const onAccessoryClick = useCallback(() => {
    const routeTo = isRemovedFromMultisig
      ? routes.multisigRemovedSettings(account.address)
      : routes.editAccount(account.address)

    navigate(routeTo)
  }, [account.address, isRemovedFromMultisig, navigate])

  return (
    <AccountListScreenItem
      onClick={onClick}
      onAccessoryClick={onAccessoryClick}
      accountName={account.name}
      accountAddress={account.address}
      networkId={account.networkId}
      accountType={account.type}
      isShield={Boolean(account.guardian)}
      avatarOutlined={status.code === "CONNECTED"}
      deploying={status.code === "DEPLOYING"}
      upgrade={needsUpgrade}
      connectedHost={isConnected ? originatingHost : undefined}
      clickNavigateSettings={clickNavigateSettings}
    />
  )
}
