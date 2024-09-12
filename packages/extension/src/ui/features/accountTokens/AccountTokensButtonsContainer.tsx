import { useDisclosure } from "@chakra-ui/react"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { hideMultisig } from "../../../shared/multisig/utils/baseMultisig"
import { ETH_TOKEN_ADDRESS } from "../../../shared/network/constants"
import { routes } from "../../../shared/ui/routes"
import { hasSavedRecoverySeedPhraseView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { autoSelectAccountOnNetwork } from "../accounts/switchAccount"
import { usePortfolioUrl } from "../actions/hooks/usePortfolioUrl"
import { useDefaultFeeToken } from "../actions/useDefaultFeeToken"
import {
  isSignerInMultisigView,
  multisigView,
} from "../multisig/multisig.state"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"
import { AccountTokensButtons } from "./AccountTokensButtons"
import { useToken } from "./tokens.state"
import { useAddFundsDialogSend } from "./useAddFundsDialog"
import { useHasFeeTokenBalance } from "./useFeeTokenBalance"
import { WalletAccount } from "../../../shared/wallet.model"
import { selectedNetworkIdView } from "../../views/network"

interface AccountTokensButtonsContainerProps {
  account?: WalletAccount
  hideSend?: boolean
}

export const AccountTokensButtonsContainer: FC<
  AccountTokensButtonsContainerProps
> = ({ account }) => {
  const navigate = useNavigate()
  const selectedNetworkId = useView(selectedNetworkIdView)
  const multisig = useView(multisigView(account))
  const signerIsInMultisig = useView(isSignerInMultisigView(account))
  const isMainnet = useIsMainnet()
  const feeToken = useDefaultFeeToken(account)

  const sendToken = useToken({
    address: feeToken?.address ?? ETH_TOKEN_ADDRESS,
    networkId: selectedNetworkId,
  })
  const hasFeeTokenBalance = useHasFeeTokenBalance(account)

  const hasSavedRecoverySeedPhrase = useView(hasSavedRecoverySeedPhraseView)

  const addFundsDialogSend = useAddFundsDialogSend()

  const onAddFunds = useCallback(() => {
    navigate(routes.funding())
  }, [navigate])

  const showSaveRecoveryPhraseModal = useMemo(() => {
    return !hasSavedRecoverySeedPhrase && isMainnet
  }, [hasSavedRecoverySeedPhrase, isMainnet])

  const showSendButton = useMemo(() => {
    if (
      showSaveRecoveryPhraseModal ||
      (multisig && (multisig.needsDeploy || !signerIsInMultisig)) ||
      !hasFeeTokenBalance
    ) {
      return false
    }

    return Boolean(sendToken)
  }, [
    multisig,
    sendToken,
    signerIsInMultisig,
    showSaveRecoveryPhraseModal,
    hasFeeTokenBalance,
  ])
  const portfolioUrl = usePortfolioUrl(account)
  const showAddFundsButton = useMemo(() => {
    if (showSaveRecoveryPhraseModal || (multisig && !signerIsInMultisig)) {
      return false
    }

    return true
  }, [multisig, signerIsInMultisig, showSaveRecoveryPhraseModal])

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
      const account = await autoSelectAccountOnNetwork(selectedNetworkId)
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

  let buttonColumnCount = 1
  if (showSendButton) {
    buttonColumnCount++
  }
  if (showSendButton && portfolioUrl) {
    buttonColumnCount++
  }

  return (
    <AccountTokensButtons
      onAddFunds={onAddFunds}
      showAddFundsButton={showAddFundsButton}
      showSendButton={showSendButton}
      onSend={onSend}
      showHideMultisigButton={showHideMultisigButton}
      onHideMultisigModalOpen={onHideMultisigModalOpen}
      onHideMultisigModalClose={onHideMultisigModalClose}
      isHideMultisigModalOpen={isHideMultisigModalOpen}
      onHideConfirm={onHideConfirm}
      portfolioUrl={portfolioUrl}
      buttonColumnCount={buttonColumnCount}
    />
  )
}
