import type { WalletAccount } from "../../../shared/wallet.model"
import { getAccountSemverVersion } from "../../../shared/utils/argentAccountVersion"
import semver from "semver"
import useSWR from "swr"

export const useShowLegacyVersionBanner = (account?: WalletAccount) => {
  const shouldFetch =
    account &&
    !account.needsDeploy &&
    account.network &&
    account.type !== "multisig" &&
    account.type !== "smart" &&
    account.type !== "imported"

  const { data: showBanner = false } = useSWR(
    account && shouldFetch
      ? ["legacyVersion", account.address, account.network.id]
      : null,
    async () => {
      try {
        if (!account) {
          return false
        }
        const version = await getAccountSemverVersion(
          account.address,
          account.network,
        )
        return !version || semver.lte(version, "0.3.0")
      } catch {
        return false
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return showBanner
}
