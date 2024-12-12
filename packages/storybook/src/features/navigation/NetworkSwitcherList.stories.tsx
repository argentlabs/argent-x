import { Meta, StoryObj } from "@storybook/react"
import { Menu } from "@chakra-ui/react"

import {
  NetworkSwitcherList,
  NetworkSwitcherListProps,
} from "@argent-x/extension/src/ui/features/navigation/NetworkSwitcherList"
import { decorators } from "../../decorators/routerDecorators"

const meta: Meta<typeof NetworkSwitcherList> = {
  component: NetworkSwitcherList,
  decorators,
}

export default meta

type Story = StoryObj<typeof NetworkSwitcherList>

const allNetworks = [
  {
    id: "mainnet-alpha",
    name: "Mainnet",
    chainId: "SN_MAIN",
    rpcUrl: "https://cloud.argent-api.com/v1/starknet/mainnet/rpc/v0.7",
    readonly: true,
    status: "green",
  },
  {
    id: "sepolia-alpha",
    name: "Sepolia",
    chainId: "SN_SEPOLIA",
    rpcUrl: "https://api.hydrogen.argent47.net/v1/starknet/sepolia/rpc/v0.7",
    readonly: true,
    status: "amber",
  },
  {
    id: "localhost",
    chainId: "SN_GOERLI",
    rpcUrl: "http://localhost:5050",
    name: "Devnet",
    status: "red",
  },
  {
    id: "integration",
    name: "Integration",
    chainId: "SN_SEPOLIA",
    rpcUrl: "https://cloud-dev.argent-api.com/v1/starknet/sepolia/rpc/v0.7",
    readonly: true,
    status: "unknown",
  },
  {
    id: "very-long-name-network",
    name: "This is a Network with an Extremely Long Name for Testing Purposes",
    chainId: "SN_LONG_NAME",
    rpcUrl: "https://very-long-name-network.example.com/rpc",
    readonly: false,
    status: "green",
  },
] as NetworkSwitcherListProps["allNetworks"]

export const Default: Story = {
  render: (args) => (
    <Menu isOpen>
      <NetworkSwitcherList {...args} />
    </Menu>
  ),
  args: {
    currentNetwork: allNetworks[0],
    allNetworks,
  },
}
