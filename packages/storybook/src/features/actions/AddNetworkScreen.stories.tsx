import { AddNetworkScreen } from "@argent-x/extension/src/ui/features/actions/AddNetworkScreen/AddNetworkScreen"
import { Network } from "@argent-x/extension/src/shared/network"

import { decorators } from "../../decorators/routerDecorators"

const network: Network = {
  id: "networkId",
  name: "Ethereum",
  chainId: "chainId",
  baseUrl: "https://mainnet.infura.io/v3/123456",
  explorerUrl: "https://etherscan.io",
  blockExplorerUrl: "https://blockchair.com/ethereum",
  rpcUrl: "https://mainnet.infura.io/v3/123456-RPC",
  status: "ok",
}

export default {
  component: AddNetworkScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    requestedNetwork: network,
  },
}
