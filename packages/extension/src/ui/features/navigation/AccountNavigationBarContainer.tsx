import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import type { NavigationBarProps } from "@argent/x-ui"
import { multisigView } from "../../features/multisig/multisig.state"
import { useIsLedgerSigner } from "../../features/ledger/hooks/useIsLedgerSigner"
import { usePortfolioUrl } from "../actions/hooks/usePortfolioUrl"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"

const argentXEnv = process.env.ARGENT_X_ENVIRONMENT || ""

export interface AccountNavigationBarContainerProps
  extends Pick<NavigationBarProps, "scroll"> {
  showSettingsButton?: boolean
  showPortfolioButton?: boolean
}

export const AccountNavigationBarContainer: FC<
  AccountNavigationBarContainerProps
> = (props) => {
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()
  const currentNetwork = useCurrentNetwork()

  const account = useView(selectedAccountView)
  const hasAccount = Boolean(account)

  const multisig = useView(multisigView(account))

  const isGuardian = Boolean(account?.guardian)
  const isMultisig = Boolean(multisig)

  const isLedgerAccount = useIsLedgerSigner(account?.id) && !isMultisig // Multisig has higher icon priority

  const onAccountList = useCallback(() => {
    navigate(routes.accounts(returnTo))
  }, [returnTo, navigate])

  const portfolioUrl = usePortfolioUrl(account)

  const onPortfolio = useCallback(() => {
    if (portfolioUrl) {
      window.open(portfolioUrl, "_blank")?.focus()
    }
  }, [portfolioUrl])

  const envLabel = argentXEnv === "hydrogen" ? "Hydrogen" : undefined

  return (
    <AccountNavigationBar
      accountName={account?.name}
      accountId={account?.id}
      isSmartAccount={isGuardian}
      isMultisig={isMultisig}
      isLedgerAccount={isLedgerAccount}
      onAccountList={onAccountList}
      showPortfolioButton={hasAccount}
      onPortfolio={() => void onPortfolio()}
      envLabel={envLabel}
      networkName={currentNetwork?.name}
      {...props}
    />
  )
}
