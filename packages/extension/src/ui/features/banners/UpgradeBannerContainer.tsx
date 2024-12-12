import type { FC } from "react"
import { useCallback, useMemo, useState } from "react"

import { accountSharedService } from "../../../shared/account/service"
import type { WalletAccount } from "../../../shared/wallet.model"
import { clientAccountService } from "../../services/account"
import { UpgradeBanner } from "./UpgradeBanner"
import { useShowAccountUpgrade } from "../accountTokens/useShowAccountUpgrade"
import { useHasDismissedUpgradeBanner } from "../multisig/hooks/useHasDimissedUpgradeBanner"
import { useView } from "../../views/implementation/react"
import { multisigView } from "../multisig/multisig.state"
import { voidify } from "@argent/x-shared"

export interface BannerRouteState {
  from?: string
}

export interface UpgradeBannerProps {
  account: WalletAccount
}

export const useShowUpgradeBanner = (account?: WalletAccount) => {
  const hasDismissedUpgradeBanner = useHasDismissedUpgradeBanner(account)
  const showAccountUpgrade = useShowAccountUpgrade(account)
  return Boolean(showAccountUpgrade && !hasDismissedUpgradeBanner)
}

export const UpgradeBannerContainer: FC<UpgradeBannerProps> = ({ account }) => {
  const multisig = useView(multisigView(account))
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const upgradeLearnMoreLink = useMemo(() => {
    if (multisig) {
      return "https://support.argent.xyz/hc/en-us/articles/20069681332509-v0-1-1-contract-upgrade-for-Argent-X-Multisig-accounts"
    }
    return "https://support.argent.xyz/hc/en-us/articles/19662145575325-Main-features-of-the-newest-account-contract-v-0-4-0"
  }, [multisig])

  const onUpgradeBannerClick = useCallback(async () => {
    setUpgradeLoading(true)
    await clientAccountService.upgrade(account)
    setUpgradeLoading(false)
  }, [account])

  const onUpgradeBannerClose = useCallback(async () => {
    if (multisig) {
      await accountSharedService.dismissUpgradeBannerForAccount(multisig)
    } else {
      await accountSharedService.dismissUpgradeBannerForAccount(account)
    }
    return
  }, [account, multisig])

  return (
    <UpgradeBanner
      loading={upgradeLoading}
      onClick={voidify(onUpgradeBannerClick)}
      learnMoreLink={upgradeLearnMoreLink}
      onClose={voidify(onUpgradeBannerClose)}
    />
  )
}
