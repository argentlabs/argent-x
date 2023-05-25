import { AlertDialog, Button, icons } from "@argent/ui"
import { Flex, SimpleGrid, useDisclosure } from "@chakra-ui/react"
import { FC, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { hideMultisig } from "../../../shared/multisig/utils/baseMultisig"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { autoSelectAccountOnNetwork } from "../accounts/switchAccount"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { MultisigHideModal } from "../multisig/MultisigDeleteModal"
import { useNetworkFeeToken, useTokensWithBalance } from "./tokens.state"
import { useAccountIsDeployed } from "./useAccountStatus"

const { AddIcon, SendIcon, PluginIcon, HideIcon } = icons

interface AccountTokensButtonsProps {
  account: Account
}

export const AccountTokensButtons: FC<AccountTokensButtonsProps> = ({
  account,
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const multisig = useMultisig(account)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)

  const sendToken = useNetworkFeeToken(switcherNetworkId)
  const { tokenDetails, tokenDetailsIsInitialising } =
    useTokensWithBalance(account)
  const accountIsDeployed = useAccountIsDeployed(account)

  const hasNonZeroBalance = useMemo(() => {
    return tokenDetails.some(({ balance }) => balance?.gt(0))
  }, [tokenDetails])

  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)

  const onCancel = useCallback(() => {
    setAlertDialogIsOpen(false)
  }, [])

  const onSend = useCallback(() => {
    /** tokenDetailsIsInitialising - balance is unknown, let the Send screen deal with it */
    if (
      accountIsDeployed &&
      (tokenDetailsIsInitialising || hasNonZeroBalance)
    ) {
      navigate(routes.sendScreen())
    } else {
      setAlertDialogIsOpen(true)
    }
  }, [
    accountIsDeployed,
    hasNonZeroBalance,
    navigate,
    tokenDetailsIsInitialising,
  ])

  const onAddFunds = useCallback(() => {
    navigate(routes.funding())
  }, [navigate])

  const onPlugins = useCallback(() => {
    navigate(routes.addPlugin(account?.address))
  }, [account?.address, navigate])

  const title = accountIsDeployed ? "Add funds" : "Deploying"
  const message = `You need to ${
    accountIsDeployed
      ? "add funds to this account"
      : "wait for this account to deploy"
  } before you can send`

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

  return (
    <Flex gap={2} mx={"auto"}>
      <AlertDialog
        isOpen={alertDialogIsOpen}
        title={title}
        message={message}
        cancelTitle={accountIsDeployed ? undefined : "OK"}
        onCancel={onCancel}
        confirmTitle="Add funds"
        onConfirm={accountIsDeployed ? onAddFunds : undefined}
      />
      <SimpleGrid columns={showSendButton ? 2 : 1} spacing={2}>
        {showAddFundsButton && (
          <Button
            onClick={onAddFunds}
            colorScheme={"tertiary"}
            size="sm"
            leftIcon={<AddIcon />}
          >
            Add funds
          </Button>
        )}
        {showSendButton && (
          <Button
            onClick={onSend}
            colorScheme={"tertiary"}
            size="sm"
            leftIcon={<SendIcon />}
          >
            Send
          </Button>
        )}
      </SimpleGrid>
      {account?.type === "plugin" && (
        <Button onClick={onPlugins} colorScheme={"tertiary"} size="sm">
          <PluginIcon />
        </Button>
      )}
      {showHideMultisigButton && (
        <Button
          onClick={onHideMultisigModalOpen}
          colorScheme={"tertiary"}
          size="sm"
          leftIcon={<HideIcon />}
        >
          Hide account
        </Button>
      )}

      <MultisigHideModal
        onClose={onHideMultisigModalClose}
        isOpen={isHideMultisigModalOpen}
        onHide={onHideConfirm}
        multisigType="active"
      />
    </Flex>
  )
}
