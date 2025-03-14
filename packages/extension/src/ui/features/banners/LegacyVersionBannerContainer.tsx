import { useState } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { clientAccountService } from "../../services/account"
import { LegacyVersionBanner } from "./LegacyVersionBanner"

export const LegacyVersionBannerContainer = ({
  account,
}: {
  account: WalletAccount
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const handleClick = async () => {
    setIsLoading(true)
    await clientAccountService.upgrade(account)
    setIsLoading(false)
  }
  return <LegacyVersionBanner onClick={handleClick} isLoading={isLoading} />
}

export { useShowLegacyVersionBanner } from "./useShowLegacyVersionBanner"
