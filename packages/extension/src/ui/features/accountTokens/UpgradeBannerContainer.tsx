import { SpacerCell } from "@argent/x-ui"
import { FC, useCallback, useMemo, useState } from "react"
import { accountSharedService } from "../../../shared/account/service"
import { WalletAccount } from "../../../shared/wallet.model"
import { clientAccountService } from "../../services/account"
import { useHasDismissedUpgradeBanner } from "../multisig/hooks/useHasDimissedUpgradeBanner"
import { Multisig } from "../multisig/Multisig"
import { UpgradeBanner } from "./UpgradeBanner"
import { useShowAccountUpgrade } from "./useShowAccountUpgrade"

export interface BannerRouteState {
  from?: string
}

export interface UpgradeBannerProps {
  account: WalletAccount
  multisig?: Multisig
  allowDismissBanner?: boolean
  addBottomSpace?: boolean
}

export const UpgradeBannerContainer: FC<UpgradeBannerProps> = ({
  account,
  multisig,
  allowDismissBanner,
  addBottomSpace,
}) => {
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const hasDismissedBanner = useHasDismissedUpgradeBanner(account)

  const upgradeBannerIsDismissed = Boolean(
    allowDismissBanner && hasDismissedBanner,
  )

  const showAccountUpgrade = useShowAccountUpgrade(account)

  const showUpgradeBanner = Boolean(
    showAccountUpgrade && !upgradeBannerIsDismissed,
  )

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
    <>
      {showUpgradeBanner && (
        <>
          <UpgradeBanner
            loading={upgradeLoading}
            onClick={() => void onUpgradeBannerClick()}
            learnMoreLink={upgradeLearnMoreLink}
            onClose={
              allowDismissBanner ? () => void onUpgradeBannerClose() : undefined
            }
          />
          {addBottomSpace && <SpacerCell />}
        </>
      )}
    </>
  )
}
