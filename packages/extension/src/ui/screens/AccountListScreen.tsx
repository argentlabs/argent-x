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
import { useAppState } from "../states/app"
import { useLocalhostPort } from "../states/localhostPort"
import { makeClickable } from "../utils/a11y"
import { deployWallet, getStatus } from "../utils/wallets"

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
  const { wallets, selectedWallet, addWallet } = useAccount()

  const walletsList = Object.values(wallets)

  const handleAddWallet = async () => {
    try {
      const newWallet = await deployWallet(switcherNetworkId, localhostPort)
      addWallet(newWallet)
      useAccount.setState({ selectedWallet: newWallet.address })
      navigate(routes.backupDownload())
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error)
    }
  }

  return (
    <AccountListWrapper>
      <Header>
        <IconButton
          size={36}
          {...makeClickable(() => navigate(routes.settings), 99)}
        >
          <MoreVertIcon />
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
            accountName={wallet.name}
            accountNumber={index + 1}
            address={wallet.address}
            status={getStatus(wallet, selectedWallet)}
            isDeleteable={switcherNetworkId === "localhost"}
          />
        ))}
        <IconButtonCenter size={48} {...makeClickable(handleAddWallet)}>
          <AddIcon fontSize="large" />
        </IconButtonCenter>
      </AccountList>
    </AccountListWrapper>
  )
}
