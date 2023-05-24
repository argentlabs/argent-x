/**
 * TODO: lets get rid of this file after confirming that upgrades are not possible for these accounts anymore anyways
 */
import { FC } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSWRConfig } from "swr"

import { accountService } from "../../../shared/account/service"
import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { ConfirmPageProps } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { useShouldShowNetworkUpgradeMessage } from "../networks/hooks/useShouldShowNetworkUpgradeMessage"
import { recover } from "../recovery/recovery.service"
import { UpgradeScreenV4 } from "./UpgradeScreenV4"

export interface UpgradeScreenV4ContainerProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  upgradeType: "account" | "network"
}

export const UpgradeScreenV4Container: FC<UpgradeScreenV4ContainerProps> = ({
  upgradeType,
  onReject,
  ...rest
}) => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { cache } = useSWRConfig()

  const selectedAccount = useView(selectedAccountView)

  const {
    v4UpgradeAvailableOnTestnet,
    v4UpgradeAvailableOnMainnet,
    v4UpgradeAvailableOnHiddenMainnet,
  } = useShouldShowNetworkUpgradeMessage()

  const removeUpgradeCache = () => {
    cache.delete(["goerli-alpha", false, "v4-upgrade-check"])
    cache.delete(["mainnet-alpha", false, "v4-upgrade-check"])
    cache.delete(["mainnet-alpha", true, "v4-upgrade-check"])
  }

  const openAccountList = async (networkId: string, showHidden = false) => {
    removeUpgradeCache()
    navigate(
      await recover({
        networkId,
        showAccountList: !showHidden,
        showHiddenAccountList: showHidden,
      }),
    )
  }

  const fromAccountTokens = Boolean(
    state && state.from === routes.accountTokens(),
  ) // state can be null

  const onClose = () => {
    if (upgradeType === "account") {
      return onReject && onReject()
    }

    if (upgradeType === "network") {
      removeUpgradeCache()
    }
  }

  const onOpenMainnet = () => {
    openAccountList("mainnet-alpha", !v4UpgradeAvailableOnMainnet)
  }

  const onOpenTestnet = () => {
    openAccountList("goerli-alpha")
  }

  const onUpgrade = async () => {
    fromAccountTokens && navigate(routes.accountTokens())
    if (!selectedAccount) {
      return
    }
    await accountService.upgrade(selectedAccount)
  }

  if (!selectedAccount) {
    return null
  }

  return (
    <UpgradeScreenV4
      fromAccountTokens={fromAccountTokens}
      onClose={onClose}
      onOpenMainnet={onOpenMainnet}
      onOpenTestnet={onOpenTestnet}
      onUpgrade={onUpgrade}
      upgradeType={upgradeType}
      v4UpgradeAvailableOnHiddenMainnet={v4UpgradeAvailableOnHiddenMainnet}
      v4UpgradeAvailableOnMainnet={v4UpgradeAvailableOnMainnet}
      v4UpgradeAvailableOnTestnet={v4UpgradeAvailableOnTestnet}
      {...rest}
    />
  )
}
