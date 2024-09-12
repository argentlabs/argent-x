import {
  ARGENT_PORTFOLIO_GOERLI_BASE_URL,
  ARGENT_PORTFOLIO_MAINNET_BASE_URL,
} from "../../../../shared/api/constants"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { useIsDefaultNetwork } from "../../networks/hooks/useIsDefaultNetwork"

export const usePortfolioUrl = (account?: BaseWalletAccount) => {
  const isDefaultNetwork = useIsDefaultNetwork()

  if (!account || !isDefaultNetwork) {
    return null
  }

  let portfolioBaseUrl: string | null
  switch (account.networkId) {
    case "mainnet-alpha":
      portfolioBaseUrl = ARGENT_PORTFOLIO_MAINNET_BASE_URL
      break
    case "sepolia-alpha":
      portfolioBaseUrl = ARGENT_PORTFOLIO_GOERLI_BASE_URL
      break
    default:
      portfolioBaseUrl = null
  }

  const portfolioUrl = portfolioBaseUrl
    ? `${portfolioBaseUrl}/${account.address}`
    : null
  return portfolioUrl
}
