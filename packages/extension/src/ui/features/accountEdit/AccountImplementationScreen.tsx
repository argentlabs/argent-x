import {
  BarBackButton,
  ButtonCell,
  H6,
  NavigationContainer,
  P4,
  icons,
} from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { filter, partition } from "lodash-es"
import { FC, ReactNode } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { ArgentAccountType } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { AutoColumn } from "../../components/Column"
import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useRouteAccount } from "../shield/useRouteAccount"

const { WalletIcon, PluginIcon, MulticallIcon, TickIcon } = icons

interface Implementation {
  id: ArgentAccountType
  title: string
  description: string
  icon: ReactNode
}
const implementations: Implementation[] = [
  {
    id: "standard",
    title: "Default",
    description: "The default Argent account implementation",
    icon: <WalletIcon />,
  },
  {
    id: "plugin",
    title: "Plugin",
    description: "The Argent account implementation with plugin support",
    icon: <PluginIcon />,
  },
  {
    id: "betterMulticall",
    title: "Better multicall",
    description:
      "The Argent account implementation with better multicall support",
    icon: <MulticallIcon />,
  },
]

interface ImplementationItemProps extends Implementation {
  active: boolean
  onClick?: () => void
}

const ImplementationItem: FC<ImplementationItemProps> = ({
  title,
  description,
  icon,
  active,
  onClick,
}) => {
  return (
    <ButtonCell
      leftIcon={icon}
      rightIcon={
        active ? (
          <TickIcon color="primary.500" />
        ) : (
          <P4 color="primary.500">Enable</P4>
        )
      }
      extendedDescription={description}
      onClick={onClick}
    >
      {title}
    </ButtonCell>
  )
}

export const AccountImplementationScreen: FC = () => {
  const selectedAccount = useView(selectedAccountView)
  const account = useRouteAccount()
  const navigate = useNavigate()

  if (!account || !selectedAccount) {
    return <></>
  }

  const isSelectedAccount = accountsEqual(selectedAccount, account)

  const handleImplementationClick = (i: Implementation) => async () => {
    if (!isSelectedAccount) {
      await accountService.select(account)
    }
    await accountService.upgrade(account, i.id)
    navigate(routes.accountTokens(), { replace: true })
  }

  const [[activeImplementation], otherImplementations] = partition(
    filter(implementations, (i) =>
      Boolean(account.network.accountClassHash?.[i.id]),
    ),
    (i) => i.id === account.type,
  )

  return (
    <NavigationContainer
      title="Change account implementation"
      leftButton={<BarBackButton />}
    >
      <Box p="5" display={"flex"} flexDirection="column" gap="4">
        {activeImplementation && (
          <>
            <H6 color="neutrals.300" pl="2">
              Current implementation
            </H6>
            <AutoColumn>
              <ImplementationItem {...activeImplementation} active={true} />
            </AutoColumn>
          </>
        )}
        {otherImplementations && (
          <>
            <H6 mt="2" pl="2" color="neutrals.300">
              Other implementations
            </H6>
            <AutoColumn gap="md">
              {otherImplementations.map((i) => (
                <ImplementationItem
                  {...i}
                  key={i.id}
                  active={false}
                  onClick={handleImplementationClick(i)}
                />
              ))}
            </AutoColumn>
          </>
        )}
      </Box>
    </NavigationContainer>
  )
}
