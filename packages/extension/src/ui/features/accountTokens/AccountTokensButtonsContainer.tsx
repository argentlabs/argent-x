import { useDisclosure } from "@chakra-ui/react"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { hideMultisig } from "../../../shared/multisig/utils/baseMultisig"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { hasSavedRecoverySeedPhraseView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { Account } from "../accounts/Account"
import { autoSelectAccountOnNetwork } from "../accounts/switchAccount"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"
import { AccountTokensButtons } from "./AccountTokensButtons"
import { useNetworkFeeToken } from "./tokens.state"
import { useAddFundsDialogSend } from "./useAddFundsDialog"

interface AccountTokensButtonsContainerProps {
  account: Account
}

export const AccountTokensButtonsContainer: FC<
  AccountTokensButtonsContainerProps
> = ({ account }) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const multisig = useMultisig(account)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  const isMainnet = useIsMainnet()
  const sendToken = useNetworkFeeToken(switcherNetworkId)

  const hasSavedRecoverySeedPhrase = useView(hasSavedRecoverySeedPhraseView)

  const addFundsDialogSend = useAddFundsDialogSend()

  const onAddFunds = useCallback(() => {
    navigate(routes.funding())
  }, [navigate])

  const onPlugins = useCallback(() => {
    navigate(routes.addPlugin(account?.address))
  }, [account?.address, navigate])

  const showSaveRecoveryPhraseModal = useMemo(() => {
    return !hasSavedRecoverySeedPhrase && isMainnet
  }, [hasSavedRecoverySeedPhrase, isMainnet])

  const showSendButton = useMemo(() => {
    if (
      showSaveRecoveryPhraseModal ||
      (multisig && (multisig.needsDeploy || !signerIsInMultisig))
    ) {
      return false
    }

    return Boolean(sendToken)
  }, [multisig, sendToken, signerIsInMultisig, showSaveRecoveryPhraseModal])

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
      const account = await autoSelectAccountOnNetwork(switcherNetworkId)
      onHideMultisigModalClose()
      if (account) {
        navigate(routes.accounts())
      } else {
        /** no accounts, return to empty account screen */
        navigate(routes.accountTokens())
      }
    }
  }, [multisig, navigate, onHideMultisigModalClose, switcherNetworkId])

  const onSend = () => addFundsDialogSend()

  return (
    <AccountTokensButtons
      account={account}
      onAddFunds={onAddFunds}
      showAddFundsButton={showAddFundsButton}
      showSendButton={showSendButton}
      onSend={onSend}
      onPlugins={onPlugins}
      showHideMultisigButton={showHideMultisigButton}
      onHideMultisigModalOpen={onHideMultisigModalOpen}
      onHideMultisigModalClose={onHideMultisigModalClose}
      isHideMultisigModalOpen={isHideMultisigModalOpen}
      onHideConfirm={onHideConfirm}
    />
  )
}
