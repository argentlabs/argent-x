import AddIcon from "@mui/icons-material/Add"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import LedgerLogo from "../../assets/ledger-logo.svg"
import { AccountListItem } from "../components/Account/AccountListItem"
import { Header } from "../components/Header"
import { IconButton } from "../components/IconButton"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { H1, P } from "../components/Typography"
import { routes } from "../routes"
import { useAccount } from "../states/account"
import { getAccountName, useAccountMetadata } from "../states/accountMetadata"
import { useAppState } from "../states/app"
import { useLocalhostPort } from "../states/localhostPort"
import { makeClickable } from "../utils/a11y"
import { connectAccount, deployAccount, getStatus } from "../utils/accounts"
import { recover } from "../utils/recovery"
import { StarkSignerType } from "../../shared/starkSigner"

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

const AccountListWrapper = styled.div`
  display: flex;
  flex-direction: column;

  ${H1} {
    text-align: center;
  }

  > ${AccountList} {
    width: 100%;
  }
`

const IconButtonCenter = styled(IconButton)`
  margin: auto;
`

const Paragraph = styled(P)`
  text-align: center;
`

export const AccountListScreen: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { localhostPort } = useLocalhostPort()
  const { accounts, selectedAccount, addAccount } = useAccount()
  const { accountNames } = useAccountMetadata()

  const accountsList = Object.values(accounts)

  const handleAddAccount = async (type: StarkSignerType) => {
    try {
      console.warn("Create a new account")
      const newAccount = await deployAccount(switcherNetworkId, localhostPort, type)
      addAccount(newAccount)
      connectAccount(newAccount, switcherNetworkId, localhostPort)
      navigate(await recover())
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error())
    }
  }

  return (
    <AccountListWrapper>
      <Header>
        <IconButton
          size={36}
          {...makeClickable(() => navigate(routes.settings()), 99)}
        >
          <MoreVertIcon />
        </IconButton>
        <NetworkSwitcher hidePort />
      </Header>
      <H1>Accounts</H1>
      <AccountList>
        {accountsList.length === 0 && (
          <Paragraph>
            No accounts on this network, click below to add one.
          </Paragraph>
        )}
        {accountsList.map((account) => (
          <AccountListItem
            key={account.address}
            isLedger={account.signer.type === "ledger_nano"}
            accountName={getAccountName(account, accountNames)}
            address={account.address}
            status={getStatus(account, selectedAccount)}
            isDeleteable={switcherNetworkId === "localhost"}
          />
        ))}
        <IconButtonCenter size={48} {...makeClickable(() => {handleAddAccount(StarkSignerType.Local)})}>
          <AddIcon fontSize="large" />
        </IconButtonCenter>
        <IconButtonCenter size={48} {...makeClickable(() => {handleAddAccount(StarkSignerType.Ledger)})}>
          <LedgerLogo />
        </IconButtonCenter>
      </AccountList>
    </AccountListWrapper>
  )
}
