import { useDisclosure } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { hideMultisig } from "../../../shared/multisig/utils/baseMultisig"
import { ETH_TOKEN_ADDRESS } from "../../../shared/network/constants"
import { routes } from "../../../shared/ui/routes"
import { useView } from "../../views/implementation/react"
import { useDefaultFeeToken } from "../actions/useDefaultFeeToken"
import {
  isSignerInMultisigView,
  multisigView,
} from "../multisig/multisig.state"
import { AccountTokensButtons } from "./AccountTokensButtons"
import { useToken } from "./tokens.state"
import { useAddFundsDialogSend } from "./useAddFundsDialog"
import { useHasFeeTokenBalance } from "./useFeeTokenBalance"
import type { WalletAccount } from "../../../shared/wallet.model"
import { selectedNetworkIdView } from "../../views/network"
import { clientAccountService } from "../../services/account"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { useHasNonZeroBalance } from "./useHasNonZeroBalance"

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
  const feeToken = useDefaultFeeToken(account)
  const isDefaultNetwork = useIsDefaultNetwork()
  const returnTo = useCurrentPathnameWithQuery()
  const hasNonZeroBalance = useHasNonZeroBalance(account)

  const sendToken = useToken({
    address: feeToken?.address ?? ETH_TOKEN_ADDRESS,
    networkId: selectedNetworkId,
  })
  const hasFeeTokenBalance = useHasFeeTokenBalance(account)

  const addFundsDialogSend = useAddFundsDialogSend()

  const onAddFunds = useCallback(() => {
    navigate(routes.funding())
  }, [navigate])

  const showSendButton = useMemo(() => {
    if (
      (multisig && (multisig.needsDeploy || !signerIsInMultisig)) ||
      !hasFeeTokenBalance
    ) {
      return false
    }

    return Boolean(sendToken)
  }, [multisig, sendToken, signerIsInMultisig, hasFeeTokenBalance])

  const showAddFundsButton = useMemo(() => {
    if (multisig && !signerIsInMultisig) {
      return false
    }
    return true
  }, [multisig, signerIsInMultisig])

  const showSwapButton = showAddFundsButton && isDefaultNetwork

  const onSwap = useCallback(() => {
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
      showAddFundsButton={showAddFundsButton}
      showHideMultisigButton={showHideMultisigButton}
      showSendButton={showSendButton}
      showSwapButton={showSwapButton}
    />
  )
}
