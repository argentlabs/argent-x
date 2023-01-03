import { AlertDialog, Button, icons } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  useNetworkFeeToken,
  useTokensWithBalance,
} from "../../../shared/tokens.state"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { useAccountIsDeployed } from "./useAccountStatus"

const { AddIcon, SendIcon, PluginIcon } = icons

interface AccountTokensButtonsProps {
  account: Account
}

export const AccountTokensButtons: FC<AccountTokensButtonsProps> = ({
  account,
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

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
      <SimpleGrid columns={sendToken ? 2 : 1} spacing={2}>
        <Button
          onClick={onAddFunds}
          colorScheme={"tertiary"}
          size="sm"
          leftIcon={<AddIcon />}
        >
          Add funds
        </Button>
        {sendToken && (
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
      {account?.type === "argent-plugin" && (
        <Button onClick={onPlugins} colorScheme={"tertiary"} size="sm">
          <PluginIcon />
        </Button>
      )}
    </Flex>
  )
}
