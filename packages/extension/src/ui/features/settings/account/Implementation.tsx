import { H6, icons } from "@argent/ui"
import { ArgentAccountType } from "../../../../shared/wallet.model"
import { FC, ReactNode } from "react"
import { AutoColumn } from "../../../components/Column"

const { WalletIcon, PluginIcon, MulticallIcon } = icons

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

export const CurrentImplementation: FC<{ implementationItem: ReactNode }> = ({
  implementationItem,
}) => (
  <>
    <H6 color="neutrals.300" pl="2">
      Current implementation
    </H6>
    <AutoColumn>{implementationItem}</AutoColumn>
  </>
)
