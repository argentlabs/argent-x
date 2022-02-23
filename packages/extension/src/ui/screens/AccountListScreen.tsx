import AddIcon from "@mui/icons-material/Add"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

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

  const handleAddAccount = async () => {
    try {
      const newAccount = await deployAccount(switcherNetworkId, localhostPort)
      addAccount(newAccount)
      connectAccount(newAccount, switcherNetworkId, localhostPort)
      recover()
      navigate(routes.backupDownload())
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
            accountName={getAccountName(account, accountNames)}
            address={account.address}
            status={getStatus(account, selectedAccount)}
            isDeleteable={switcherNetworkId === "localhost"}
          />
        ))}
        <IconButtonCenter size={48} {...makeClickable(handleAddAccount)}>
          <AddIcon fontSize="large" />
        </IconButtonCenter>
      </AccountList>
    </AccountListWrapper>
  )
}
