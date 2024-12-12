import type { FC } from "react"

import type { WalletAccount } from "../../../shared/wallet.model"
import { AccountBanners } from "./AccountBanners"
import { useBanners } from "./useBanners"

interface AccountBannersContainerProps {
  account: WalletAccount
}

export const AccountBannersContainer: FC<AccountBannersContainerProps> = ({
  account,
}) => {
  const banners = useBanners(account)
  return <AccountBanners banners={banners} />
}
