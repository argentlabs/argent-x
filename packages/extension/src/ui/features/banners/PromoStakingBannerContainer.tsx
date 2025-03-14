import { useAtom, useAtomValue } from "jotai"
import { atomWithStorage } from "jotai/utils"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import { useCallback } from "react"
import { stakingStore } from "../../../shared/staking/storage"
import { routes } from "../../../shared/ui/routes"
import { useKeyValueStorage } from "../../hooks/useStorage"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import type { BannerProps } from "./Banner"
import { PromoStakingBanner } from "./PromoStakingBanner"

export const hasDismissedPromoStakingBannereAtom = atomWithStorage(
  "hasDismissedPromoStakingBanner",
  false,
  undefined,
  {
    getOnInit: true,
  },
)

export const useShowPromoStakingBanner = () => {
  const hasDismissedPromoStakingBanner = useAtomValue(
    hasDismissedPromoStakingBannereAtom,
  )
  const isStakingEnabled = useKeyValueStorage(stakingStore, "enabled")
  const isDefaultNetwork = useIsDefaultNetwork()

  return isDefaultNetwork && isStakingEnabled && !hasDismissedPromoStakingBanner
}

export const PromoStakingBannerContainer: FC<BannerProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_hasDismissedPromoStakingBanner, setHasDismissedPromoStakingBanner] =
    useAtom(hasDismissedPromoStakingBannereAtom)
  const navigate = useNavigate()

  const onClick = useCallback(() => {
    void navigate(routes.staking())
  }, [navigate])

  const onClose = useCallback(() => {
    setHasDismissedPromoStakingBanner(true)
  }, [setHasDismissedPromoStakingBanner])

  const apyPercentage = useKeyValueStorage(stakingStore, "nativeApyPercentage")

  return (
    <PromoStakingBanner
      onClick={onClick}
      onClose={onClose}
      apyPercentage={apyPercentage}
      {...props}
    />
  )
}
