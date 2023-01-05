import {
  ScrollContainer,
  Tab,
  TabBar,
  icons,
  useScrollRestoration,
} from "@argent/ui"
import { FC, PropsWithChildren } from "react"
import { NavLink } from "react-router-dom"

import { routes } from "../../routes"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { useSelectedAccount } from "./accounts.state"
import { useAccountTransactions } from "./accountTransactions.state"

const { WalletIcon, NftIcon, ActivityIcon, SwapIcon } = icons

export interface AccountContainerProps extends PropsWithChildren {
  scrollKey: string
}

export const AccountContainer: FC<AccountContainerProps> = ({
  scrollKey,
  children,
}) => {
  const account = useSelectedAccount()
  const { pendingTransactions } = useAccountTransactions(account)
  const { scrollRef, scroll } = useScrollRestoration(scrollKey)

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
          replace
          icon={<WalletIcon />}
          label="Tokens"
        />
        <Tab
          as={NavLink}
          to={routes.accountCollections()}
          replace
          icon={<NftIcon />}
          label="NFTs"
        />
        <Tab
          as={NavLink}
          to={routes.swap()}
          replace
          icon={<SwapIcon />}
          label="Swap"
        />
        <Tab
          as={NavLink}
          to={routes.accountActivity()}
          replace
          icon={<ActivityIcon />}
          badgeLabel={pendingTransactions.length}
          badgeDescription={"Pending transactions"}
          label="Activity"
        />
      </TabBar>
    </>
  )
}
