import useSWR from "swr"
import { provisionService } from "../../../services/provision"

import airdropBanner from "@argent/ui/assets/airdrop.png"
import airdropHalted from "@argent/ui/assets/airdropHalted.png"
import {
  provisionBannerAtom,
  provisionBannerStore,
} from "../../../services/provision/provision.state"
import { RefreshInterval } from "../../../../shared/config"
import { useView } from "../../../views/implementation/react"

export const useProvisionBanner = () => {
  const { lastDismissedStatus } = useView(provisionBannerAtom)

  const { data: provisionStatus } = useSWR(
    "provisionStatus",
    async () => {
      const provisionStatus = await provisionService.getStatus()

      if (provisionStatus.status === "disabled") {
        return undefined
      }

      let bannerUrl
      if (
        provisionStatus.status === "notActive" ||
        provisionStatus.status === "paused"
      ) {
        bannerUrl = airdropHalted
      } else {
        bannerUrl = airdropBanner
      }
      return {
        ...provisionStatus,
        bannerUrl,
      }
    },
    {
      refreshInterval: RefreshInterval.MEDIUM * 1000,
      dedupingInterval: RefreshInterval.MEDIUM * 1000,
    },
  )

  const onProvisionBannerClose = () => {
    void provisionBannerStore.set({
      lastDismissedStatus: provisionStatus?.status ?? null,
    })
  }

  const shouldShowProvisionBanner =
    provisionStatus && provisionStatus?.status !== lastDismissedStatus
  return {
    shouldShowProvisionBanner,
    provisionStatus,
    onProvisionBannerClose,
  }
}
