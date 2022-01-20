import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import Add from "../../assets/add.svg"
import Settings from "../../assets/settings.svg"
import { AccountList, AccountListItem } from "../components/Account/AccountList"
import { Header } from "../components/Header"
import { IconButton } from "../components/IconButton"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { H1, P } from "../components/Typography"
import { routes } from "../routes"
import { useGlobalState } from "../states/global"
import { makeClickable } from "../utils/a11y"
import { getStatus } from "../utils/wallet"

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
  const { wallets, selectedWallet: activeWallet } = useGlobalState()
  const navigate = useNavigate()

  const walletsList = Object.values(wallets)

  return (
    <AccountListWrapper>
      <Header>
        <IconButton
          size={36}
          {...makeClickable(() => navigate(routes.settings), 99)}
        >
          <Settings />
        </IconButton>
        <NetworkSwitcher hidePort />
      </Header>
      <H1>Accounts</H1>
      <AccountList>
        {walletsList.length === 0 && (
          <Paragraph>
            No wallets on this network, click below to add one.
          </Paragraph>
        )}
        {walletsList.map((wallet, index) => (
          <AccountListItem
            key={wallet.address}
            accountNumber={index + 1}
            address={wallet.address}
            status={getStatus(wallet, activeWallet)}
          />
        ))}
        <IconButtonCenter
          size={48}
          {...makeClickable(() => navigate(routes.newAccount))}
        >
          <Add />
        </IconButtonCenter>
      </AccountList>
    </AccountListWrapper>
  )
}
