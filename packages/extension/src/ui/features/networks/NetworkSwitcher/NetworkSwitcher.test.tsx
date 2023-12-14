import { Menu } from "@chakra-ui/react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Network, NetworkStatus } from "../../../../shared/network"
import { mapNetworkStatusToColor } from "../../../components/StatusIndicator"
import { NetworkSwitcherList } from "./NetworkSwitcherList"

export const mockNetworks = [
  {
    id: "1",
    name: "Mainnet",
    rpcUrl: "https://mainnet.infura.io",
    chainId: "chainId",
    status: "ok",
  },
  {
    id: "2",
    name: "Rinkeby",
    rpcUrl: "https://rinkeby.infura.io",
    chainId: "chainId",
    status: "error",
  },
  {
    id: "3",
    name: "Kovan",
    rpcUrl: "https://kovan.infura.io",
    chainId: "chainId",
    status: "degraded",
  },
] as (Network & { status: NetworkStatus })[]

const mockNetworkStatuses = {
  "1": "ok",
  "2": "degraded",
  "3": "error",
} as Partial<Record<string, NetworkStatus>>

const mockCurrentNetwork = mockNetworks[0]

describe("NetworkSwitcherList", () => {
  it("renders all the network options", () => {
    const handleChangeNetwork = vi.fn()
    render(
      <Menu>
        <NetworkSwitcherList
          currentNetwork={mockCurrentNetwork}
          allNetworks={mockNetworks}
          onChangeNetwork={handleChangeNetwork}
        />
      </Menu>,
    )

    mockNetworks.forEach(({ name }) => {
      expect(screen.getByTestId(name)).toBeInTheDocument()
    })
  })

  it("calls onChangeNetwork when a network is clicked", async () => {
    const handleChangeNetwork = vi.fn()

    render(
      <Menu>
        <NetworkSwitcherList
          currentNetwork={mockCurrentNetwork}
          allNetworks={mockNetworks}
          onChangeNetwork={handleChangeNetwork}
        />
      </Menu>,
    )

    const networkToSelect = mockNetworks[1]
    const networkMenuItemToSelect = screen.getByTestId(networkToSelect.name)

    await userEvent.click(networkMenuItemToSelect)

    expect(handleChangeNetwork).toHaveBeenCalledWith(networkToSelect.id)
  })

  // Temp: This is commented out until we have a final decision on RPC provider
  it.skip("displays the network status indicator for each network", () => {
    const handleChangeNetwork = vi.fn()
    render(
      <Menu>
        <NetworkSwitcherList
          currentNetwork={mockCurrentNetwork}
          allNetworks={mockNetworks}
          onChangeNetwork={handleChangeNetwork}
        />
      </Menu>,
    )

    mockNetworks.forEach(({ id }) => {
      const networkStatus = mockNetworkStatuses[id]
      const statusIndicator = screen.getByTestId(
        `status-indicator-${mapNetworkStatusToColor(networkStatus)}`,
      )

      expect(statusIndicator).toBeInTheDocument()
      if (networkStatus) {
        expect(statusIndicator).toHaveStyle({
          backgroundColor: expect.stringContaining(networkStatus),
        })
      }
    })
  })

  it("displays the network name and Rpc URL", () => {
    const onChangeNetwork = vi.fn()
    const selectedNetwork = mockNetworks[1]

    render(
      <Menu>
        <NetworkSwitcherList
          currentNetwork={mockCurrentNetwork}
          allNetworks={mockNetworks}
          onChangeNetwork={onChangeNetwork}
        />
      </Menu>,
    )

    const menuItem = screen.getByTestId(selectedNetwork.name)
    const nameElement = within(menuItem).getByText(selectedNetwork.name)

    if (selectedNetwork.rpcUrl) {
      const baseUrlElement = within(menuItem).getByText(selectedNetwork.rpcUrl)
      expect(baseUrlElement).toBeInTheDocument()
    }
    expect(nameElement).toBeInTheDocument()
  })
})
