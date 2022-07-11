import { FC, useCallback, useMemo, useState } from "react"
import styled from "styled-components"

import { makeClickable } from "../../../services/a11y"
import { P } from "../../../theme/Typography"
import { Account } from "../../accounts/Account"
import { useAccounts } from "../../accounts/accounts.state"
import { ConfirmPageProps, ConfirmScreen } from "../ConfirmScreen"
import { ConnectDappAccountListItem } from "./ConnectDappAccountListItem"
import { usePreAuthorizations } from "./usePreAuthorizations"

interface ConnectDappProps extends Omit<ConfirmPageProps, "onSubmit"> {
  onConnect: (selectedAccount: Account) => void
  onDisconnect: (selectedAccount: Account) => void
  host: string
}

const Code = styled.code`
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  padding: 0 0.5em;
`

export const ConnectDappScreen: FC<ConnectDappProps> = ({
  onConnect: onConnectProp,
  onDisconnect: onDisconnectProp,
  onReject: onRejectProp,
  host,
  ...rest
}) => {
  const { preAuthorizations } = usePreAuthorizations()
  const { accounts, selectedAccount: initiallySelectedAccount } = useAccounts()
  const [connectAccountAddress, setConnectAccountAddress] = useState(
    initiallySelectedAccount?.address,
  )
  const getIsConnected = useCallback(
    (accountAddress: string) => {
      return (
        preAuthorizations?.accountsByHost[host] &&
        preAuthorizations?.accountsByHost[host].includes(accountAddress)
      )
    },
    [host, preAuthorizations],
  )

  const selectedAccountIsAlreadyConnected = useMemo(() => {
    return connectAccountAddress && getIsConnected(connectAccountAddress)
  }, [connectAccountAddress, getIsConnected])

  const selectedAccount = useMemo(() => {
    if (connectAccountAddress) {
      const account = accounts.find(
        ({ address }) => address === connectAccountAddress,
      )
      return account
    }
  }, [accounts, connectAccountAddress])

  const onConnect = useCallback(() => {
    selectedAccount && onConnectProp(selectedAccount)
  }, [onConnectProp, selectedAccount])

  const onDisconnect = useCallback(() => {
    selectedAccount && onDisconnectProp(selectedAccount)
  }, [onDisconnectProp, selectedAccount])

  return (
    <ConfirmScreen
      title="Connect to dapp"
      confirmButtonText={
        selectedAccountIsAlreadyConnected ? "Continue" : "Connect"
      }
      rejectButtonText={
        selectedAccountIsAlreadyConnected ? "Disconnect" : "Reject"
      }
      onSubmit={onConnect}
      onReject={selectedAccountIsAlreadyConnected ? onDisconnect : onRejectProp}
      {...rest}
    >
      <P>
        <Code>{host}</Code> wants to connect to your wallet. If you allow this
        request the website will be able to read your wallet addresses and
        request transactions, which you still need to sign.
      </P>
      {accounts.map((account) => {
        const isConnected = getIsConnected(account.address)
        return (
          <ConnectDappAccountListItem
            {...makeClickable(() => {
              setConnectAccountAddress(account.address)
            })}
            key={account.address}
            account={account}
            outline={connectAccountAddress === account.address}
            connected={isConnected}
          />
        )
      })}
    </ConfirmScreen>
  )
}
