import { ScrollContainer, Tab, TabBar, icons, useScroll } from "@argent/ui"
import { FC, PropsWithChildren } from "react"
import { NavLink } from "react-router-dom"
import styled, { css } from "styled-components"

import { Header } from "../../components/Header"
import { routes } from "../../routes"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { useSelectedAccount } from "./accounts.state"
import { useAccountTransactions } from "./accountTransactions.state"

const { WalletIcon, NftIcon, ActivityIcon, SwapIcon } = icons

export const DeprecatedContainer = styled.div<{
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

  ${Header} > a {
    width: 36px;
    height: 36px;
  }
`

export const AccountContainer: FC<PropsWithChildren> = ({ children }) => {
  const account = useSelectedAccount()
  const { pendingTransactions } = useAccountTransactions(account)
  const { scrollRef, scroll } = useScroll()

  if (!account) {
    return <></>
  }

  return (
    <>
      <AccountNavigationBar scroll={scroll} />
      <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
      <TabBar>
        <Tab
          as={NavLink}
          to={routes.accountTokens()}
          icon={<WalletIcon />}
          label="Tokens"
        />
        <Tab
          as={NavLink}
          to={routes.accountCollections()}
          icon={<NftIcon />}
          label="NFTs"
        />
        <Tab as={NavLink} to={routes.swap()} icon={<SwapIcon />} label="Swap" />
        <Tab
          as={NavLink}
          to={routes.accountActivity()}
          icon={<ActivityIcon />}
          badgeLabel={pendingTransactions.length}
          badgeDescription={"Pending transactions"}
          label="Activity"
        />
      </TabBar>
    </>
  )
}
