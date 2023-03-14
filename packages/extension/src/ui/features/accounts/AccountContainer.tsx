import {
  L1,
  ScrollContainer,
  Tab,
  TabBar,
  icons,
  useScrollRestoration,
} from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"
import { NavLink } from "react-router-dom"

import { routes } from "../../routes"
import { useMultisig } from "../multisig/multisig.state"
import { WithEscapeWarning } from "../shield/escape/WithEscapeWarning"
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

  const multisig = useMultisig(account)
  const showActivateBanner = Boolean(multisig?.needsDeploy) // False if multisig is undefined

  if (!account) {
    return <></>
  }

  return (
    <WithEscapeWarning>
      <AccountNavigationBar scroll={scroll} />
      <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
      {showActivateBanner ? (
        <Center backgroundColor="warning.500" width="full" p="13px 10px">
          <L1 color="neutrals.700">Not activated</L1>
        </Center>
      ) : (
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
      )}
    </WithEscapeWarning>
  )
}
