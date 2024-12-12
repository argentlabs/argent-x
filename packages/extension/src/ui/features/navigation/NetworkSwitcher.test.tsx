import { Menu } from "@chakra-ui/react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { Network, ColorStatus } from "../../../shared/network"
import { NetworkSwitcherList } from "./NetworkSwitcherList"
import { networkStatusMapping } from "../../components/StatusIndicator"

export const mockNetworks = [
  {
    id: "1",
    name: "Mainnet",
    rpcUrl: "https://mainnet.infura.io",
    chainId: "chainId",
    status: "green",
  },
  {
    id: "2",
    name: "Rinkeby",
    rpcUrl: "https://rinkeby.infura.io",
    chainId: "chainId",
    status: "amber",
  },
  {
    id: "3",
    name: "Kovan",
    rpcUrl: "https://kovan.infura.io",
    chainId: "chainId",
    status: "red",
  },
] as (Network & { status: ColorStatus })[]

const mockNetworkStatuses = {
  "1": "green",
  "2": "amber",
  "3": "red",
} as Partial<Record<string, ColorStatus>>

const mockCurrentNetwork = mockNetworks[0]

describe("NetworkSwitcherList", () => {
  it("renders all the network options", () => {
    const handleChangeNetwork = vi.fn()
    render(
      <Menu>
        <NetworkSwitcherList
          networkId={mockCurrentNetwork.id}
          allNetworks={mockNetworks}
          onChangeNetworkId={handleChangeNetwork}
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
          networkId={mockCurrentNetwork.id}
          allNetworks={mockNetworks}
          onChangeNetworkId={handleChangeNetwork}
        />
      </Menu>,
    )

    const networkToSelect = mockNetworks[1]
    const networkMenuItemToSelect = screen.getByTestId(networkToSelect.name)

    await userEvent.click(networkMenuItemToSelect)

    expect(handleChangeNetwork).toHaveBeenCalledWith(networkToSelect.id)
  })

  it("displays the network status indicator for each network", () => {
    const handleChangeNetwork = vi.fn()
    render(
      <Menu>
        <NetworkSwitcherList
          networkId={mockCurrentNetwork.id}
          allNetworks={mockNetworks}
          onChangeNetworkId={handleChangeNetwork}
        />
      </Menu>,
    )

    mockNetworks.forEach(({ id }) => {
      const networkStatus = mockNetworkStatuses[id]
      const statusIndicator = screen.getByTestId(
        `status-indicator-${
          networkStatusMapping[networkStatus as ColorStatus].color
        }`,
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
          networkId={mockCurrentNetwork.id}
          allNetworks={mockNetworks}
          onChangeNetworkId={onChangeNetwork}
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
