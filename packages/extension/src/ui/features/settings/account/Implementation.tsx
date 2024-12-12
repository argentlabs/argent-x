import { H5, icons } from "@argent/x-ui"
import type { ArgentAccountType } from "../../../../shared/wallet.model"
import type { FC, ReactNode } from "react"
import { Box } from "@chakra-ui/react"

const { WalletSecondaryIcon, StackSecondaryIcon, PluginIcon } = icons

export interface Implementation {
  id: ArgentAccountType
  title: string
  description: string
  icon: ReactNode
}

export interface ImplementationItemProps extends Implementation {
  active: boolean
  onClick?: () => void
}

export const implementations: Implementation[] = [
  {
    id: "standard",
    title: "Default",
    description: "The default Argent account implementation",
    icon: <WalletSecondaryIcon />,
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
    icon: <StackSecondaryIcon />,
  },
]

export const CurrentImplementation: FC<{ implementationItem: ReactNode }> = ({
  implementationItem,
}) => (
  <>
    <H5 color="neutrals.300" pl="2">
      Current implementation
    </H5>
    <Box>{implementationItem}</Box>
  </>
)
