import { useDisclosure } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { hideMultisig } from "../../../shared/multisig/utils/baseMultisig"
import { routes } from "../../../shared/ui/routes"
import { useView } from "../../views/implementation/react"
import {
  isSignerInMultisigView,
  multisigView,
} from "../multisig/multisig.state"
import { AccountTokensButtons } from "./AccountTokensButtons"
import { useToken } from "./tokens.state"
import { useAddFundsDialogSend } from "./useAddFundsDialog"
import type { WalletAccount } from "../../../shared/wallet.model"
import { selectedNetworkIdView } from "../../views/network"
import { clientAccountService } from "../../services/account"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { useHasNonZeroBalance } from "./useHasNonZeroBalance"
import { usePortfolioUrl } from "../actions/hooks/usePortfolioUrl"
import { ampli } from "../../../shared/analytics"
import { useNativeFeeTokenAddress } from "../actions/useNativeFeeToken"

interface AccountTokensButtonsContainerProps {
  account?: WalletAccount
}

export const AccountTokensButtonsContainer: FC<
  AccountTokensButtonsContainerProps
> = ({ account }) => {
  const navigate = useNavigate()
  const selectedNetworkId = useView(selectedNetworkIdView)
  const multisig = useView(multisigView(account))
  const signerIsInMultisig = useView(isSignerInMultisigView(account))
  const feeTokenAddress = useNativeFeeTokenAddress(account)
  const isDefaultNetwork = useIsDefaultNetwork()
  const returnTo = useCurrentPathnameWithQuery()
  const hasNonZeroBalance = useHasNonZeroBalance(account)

  const sendToken = useToken({
    address: feeTokenAddress,
    networkId: selectedNetworkId,
  })

  const addFundsDialogSend = useAddFundsDialogSend()

  const onAddFunds = useCallback(() => {
    navigate(routes.funding())
  }, [navigate])

  const showSendButton = useMemo(() => {
    if (multisig && (multisig.needsDeploy || !signerIsInMultisig)) {
      return false
    }

    return Boolean(sendToken)
  }, [multisig, sendToken, signerIsInMultisig])

  const showAddFundsButton = useMemo(() => {
    if (multisig && !signerIsInMultisig) {
      return false
    }
    return true
  }, [multisig, signerIsInMultisig])

  const showSwapButton = showAddFundsButton && isDefaultNetwork

  const onSwap = useCallback(() => {
    void ampli.swapTabClicked({
      "wallet platform": "browser extension",
      "swap entered from": "home tab",
    })
    navigate(routes.swapToken(undefined, returnTo))
  }, [navigate, returnTo])

  const showHideMultisigButton = useMemo(() => {
    return multisig && !signerIsInMultisig
  }, [multisig, signerIsInMultisig])

  const {
    isOpen: isHideMultisigModalOpen,
    onOpen: onHideMultisigModalOpen,
    onClose: onHideMultisigModalClose,
  } = useDisclosure()

  const onHideConfirm = useCallback(async () => {
    if (multisig) {
      await hideMultisig(multisig)
      const account =
        await clientAccountService.autoSelectAccountOnNetwork(selectedNetworkId)
      onHideMultisigModalClose()
      if (account) {
        navigate(routes.accounts())
      } else {
        /** no accounts, return to empty account screen */
        navigate(routes.accountTokens())
      }
    }
  }, [multisig, navigate, onHideMultisigModalClose, selectedNetworkId])

  const onSend = () => addFundsDialogSend()

  const portfolioUrl = usePortfolioUrl(account)

  const onPortfolio = useCallback(() => {
    if (portfolioUrl) {
      window.open(portfolioUrl, "_blank")?.focus()
    }
  }, [portfolioUrl])

  const showPortfolioButton = Boolean(portfolioUrl)

  return (
    <AccountTokensButtons
      hasNonZeroBalance={hasNonZeroBalance}
      isHideMultisigModalOpen={isHideMultisigModalOpen}
      onAddFunds={onAddFunds}
      onHideConfirm={onHideConfirm}
      onHideMultisigModalClose={onHideMultisigModalClose}
      onHideMultisigModalOpen={onHideMultisigModalOpen}
      onSend={onSend}
      onSwap={onSwap}
      onPortfolio={onPortfolio}
      showAddFundsButton={showAddFundsButton}
      showHideMultisigButton={showHideMultisigButton}
      showSendButton={showSendButton}
      showSwapButton={showSwapButton}
      showPortfolioButton={showPortfolioButton}
    />
  )
}
