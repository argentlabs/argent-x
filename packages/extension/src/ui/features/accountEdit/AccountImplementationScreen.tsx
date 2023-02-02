import { BarBackButton, H3, H6, NavigationContainer, icons } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { filter, partition } from "lodash-es"
import { FC, ReactNode } from "react"
import { useNavigate } from "react-router-dom"

import { mapArgentAccountTypeToImplementationKey } from "../../../shared/network/utils"
import { ArgentAccountType } from "../../../shared/wallet.model"
import { AutoColumn } from "../../components/Column"
import { routes } from "../../routes"
import { upgradeAccount } from "../../services/backgroundAccounts"
import { useSelectedAccount } from "../accounts/accounts.state"

const {
  WalletIcon,
  PluginIcon,
  UpgradeIcon,
  CheckboxActiveIcon,
  ChevronRightIcon,
} = icons

interface Implementation {
  id: ArgentAccountType
  title: string
  description: string
  icon: ReactNode
}
const implementations: Implementation[] = [
  {
    id: "argent",
    title: "Default Implementation",
    description: "The default Argent account implementation",
    icon: <WalletIcon />,
  },
  {
    id: "argent-plugin",
    title: "Plugin Implementation",
    description: "The Argent account implementation with plugin support",
    icon: <PluginIcon />,
  },
  {
    id: "argent-better-multicall",
    title: "Better Multicall Implementation",
    description:
      "The Argent account implementation with better multicall support",
    icon: <UpgradeIcon />,
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
    <Box
      bg="neutrals.700"
      p="4"
      borderRadius="md"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      fontSize={"md"}
      onClick={onClick}
      gap="4"
      cursor={active ? "default" : "pointer"}
      transition="all 0.2s"
      _hover={
        active
          ? {}
          : {
              bg: "neutrals.600",
            }
      }
    >
      <Box flex="0" width="32">
        {icon}
      </Box>
      <Box flex="1" fontSize={"sm"}>
        <H6 mb="1">{title}</H6>
        <p>{description}</p>
      </Box>
      <Box flex="0">
        {active ? <CheckboxActiveIcon /> : <ChevronRightIcon />}
      </Box>
    </Box>
  )
}

export const AccountImplementationScreen: FC = () => {
  const account = useSelectedAccount()
  const navigate = useNavigate()

  if (!account) {
    return <></>
  }

  const [[activeImplementation], otherImplementations] = partition(
    filter(implementations, (i) =>
      Boolean(
        account.network.accountClassHash?.[
          mapArgentAccountTypeToImplementationKey(i.id)
        ],
      ),
    ),
    (i) => i.id === account.type,
  )

  return (
    <NavigationContainer leftButton={<BarBackButton />}>
      <Box p="5" display={"flex"} flexDirection="column" gap="4">
        {activeImplementation && (
          <>
            <H3>Current implementation</H3>
            <AutoColumn>
              <ImplementationItem {...activeImplementation} active={true} />
            </AutoColumn>
          </>
        )}
        {otherImplementations && (
          <>
            <H3>Other implementations</H3>
            <AutoColumn gap="md">
              {otherImplementations.map((i) => (
                <ImplementationItem
                  {...i}
                  key={i.id}
                  active={false}
                  onClick={async () => {
                    await upgradeAccount(account, i.id)
                    navigate(routes.accountTokens(), { replace: true })
                  }}
                />
              ))}
            </AutoColumn>
          </>
        )}
      </Box>
    </NavigationContainer>
  )
}
