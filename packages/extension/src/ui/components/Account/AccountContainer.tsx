import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"
import { FC, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import styled, { css } from "styled-components"

import { routes } from "../../routes"
import { useSelectedAccount } from "../../states/account"
import {
  getAccountName,
  useAccountMetadata,
} from "../../states/accountMetadata"
import { makeClickable } from "../../utils/a11y"
import { getAccountImageUrl } from "../../utils/accounts"
import { Header } from "../Header"
import { NetworkSwitcher } from "../NetworkSwitcher"
import { AccountFooter, FooterTab } from "./AccountFooter"
import { AccountHeader } from "./AccountHeader"
import { ProfilePicture } from "./ProfilePicture"

export const Container = styled.div<{
  header?: boolean
  footer?: boolean
}>`
  ${({ header = false }) =>
    header &&
    css`
      padding-top: 68px;
    `}
  ${({ footer = false }) =>
    footer &&
    css`
      padding-bottom: 64px;
    `}
`

interface AccountScreenContentProps {
  children?: ReactNode
}

export const AccountContainer: FC<AccountScreenContentProps> = ({
  children,
}) => {
  const navigate = useNavigate()
  const { accountNames } = useAccountMetadata()
  const account = useSelectedAccount()

  if (!account) {
    return <></>
  }
  const accountName = getAccountName(account, accountNames)

  return (
    <Container header footer>
      <AccountHeader>
        <Header>
          <ProfilePicture
            {...makeClickable(() => navigate(routes.accounts()))}
            src={getAccountImageUrl(accountName, account.address)}
          />
          <NetworkSwitcher />
        </Header>
      </AccountHeader>
      {children}
      <AccountFooter>
        <FooterTab onClick={() => navigate(routes.accountTokens())}>
          <AccountBalanceWalletIcon />
          <span>Tokens</span>
        </FooterTab>
        <FooterTab onClick={() => navigate(routes.accountNfts())}>
          <PhotoLibraryIcon />
          <span>Collectibles</span>
        </FooterTab>
        <FooterTab onClick={() => navigate(routes.accountActivity())}>
          <FormatListBulletedIcon />
          <span>Activity</span>
        </FooterTab>
      </AccountFooter>
    </Container>
  )
}
