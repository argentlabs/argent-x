import { FC, useCallback, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { getFeeToken } from "../../../shared/token/utils"
import { useAppState } from "../../app.state"
import { AlertDialog } from "../../components/AlertDialog"
import { IconButton } from "../../components/IconButton"
import { AddIcon, SendIcon } from "../../components/Icons/MuiIcons"
import { PluginIcon } from "../../components/Icons/PluginIcon"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { useTokensWithBalance } from "./tokens.state"
import { useAccountIsDeployed } from "./useAccountStatus"

const Container = styled.div`
  margin: 8px 0 24px 0;
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 36px;
`

const LabeledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  color: inherit;
  text-decoration: inherit;
  cursor: pointer;

  ${IconButton} {
    background-color: rgba(255, 255, 255, 0.25);

    &:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }
  }

  & > label {
    margin-top: 12px;
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
  }
`

interface TransferButtonsProps {
  account: Account
}

export const TransferButtons: FC<TransferButtonsProps> = ({ account }) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  const sendToken = getFeeToken(switcherNetworkId)
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

  const title = accountIsDeployed ? "Add funds" : "Deploying"
  const message = `You need to ${
    accountIsDeployed
      ? "add funds to this account"
      : "wait for this account to deploy"
  } before you can send`

  return (
    <Container>
      <AlertDialog
        isOpen={alertDialogIsOpen}
        title={title}
        message={message}
        cancelTitle={accountIsDeployed ? undefined : "OK"}
        onCancel={onCancel}
        confirmTitle="Add funds"
        onConfirm={accountIsDeployed ? onAddFunds : undefined}
      />
      <LabeledLink as="div" onClick={onAddFunds}>
        <IconButton size={40}>
          <AddIcon fontSize="large" />
        </IconButton>
        <label>Add funds</label>
      </LabeledLink>
      {sendToken && (
        <LabeledLink as="div" onClick={onSend}>
          <IconButton size={40}>
            <SendIcon fontSize="medium" />
          </IconButton>
          <label>Send</label>
        </LabeledLink>
      )}
      {account?.type === "argent-plugin" && (
        <LabeledLink to={routes.addPlugin(account?.address)}>
          <IconButton size={40}>
            <PluginIcon style={{ width: 16, height: 16 }} />
          </IconButton>
          <label>Plugins</label>
        </LabeledLink>
      )}
    </Container>
  )
}
