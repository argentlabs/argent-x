import AddIcon from "@mui/icons-material/Add"
import SettingsIcon from "@mui/icons-material/Settings"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import useSWR from "swr"

import { getNetwork } from "../../shared/networks"
import { Container } from "../components/Account/AccountContainer"
import { AccountHeader } from "../components/Account/AccountHeader"
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
import { checkIfUpdateAvailable } from "../utils/upgrade"

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

const AccountListWrapper = styled(Container)`
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
      navigate(await recover())
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error())
    }
  }

  const { data: accountUpdatesList = {} } = useSWR(
    [
      accountsList,
      accountsList.map(
        (account) => getNetwork(account.networkId).accountImplementation,
      ),
    ],
    async (
      accounts,
      accountImplementations,
    ): Promise<{
      [account: string]: boolean
    }> => {
      const accountUpdates = await Promise.all(
        accounts.map((account, index) => {
          return checkIfUpdateAvailable(account, accountImplementations[index])
        }),
      )
      return accounts.reduce(
        (acc, account, index) => ({
          ...acc,
          [account.address]: accountUpdates[index],
        }),
        {},
      )
    },
    {
      suspense: false,
    },
  )

  return (
    <AccountListWrapper header>
      <AccountHeader>
        <Header>
          <IconButton
            size={36}
            {...makeClickable(() => navigate(routes.settings()), 99)}
          >
            <SettingsIcon />
          </IconButton>
          <NetworkSwitcher hidePort />
        </Header>
      </AccountHeader>
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
            hasUpdate={accountUpdatesList[account.address] || false}
          />
        ))}
        <IconButtonCenter size={48} {...makeClickable(handleAddAccount)}>
          <AddIcon fontSize="large" />
        </IconButtonCenter>
      </AccountList>
    </AccountListWrapper>
  )
}
