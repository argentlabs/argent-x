import { Menu } from "@chakra-ui/react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Network, NetworkStatus } from "../../../../shared/network"
import { mapNetworkStatusToColor } from "../../../components/StatusIndicator"
import { NetworkSwitcherList } from "./NetworkSwitcherList"

const mockNetworks = [
  {
    id: "1",
    name: "Mainnet",
    baseUrl: "https://mainnet.infura.io",
    chainId: "chainId",
    status: "ok",
  },
  {
    id: "2",
    name: "Rinkeby",
    baseUrl: "https://rinkeby.infura.io",
    chainId: "chainId",
    status: "error",
  },
  {
    id: "3",
    name: "Kovan",
    baseUrl: "https://kovan.infura.io",
    chainId: "chainId",
    status: "degraded",
  },
] as Network[]

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

  it("calls onChangeNetwork when a network is clicked", () => {
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

    userEvent.click(networkMenuItemToSelect)

    expect(handleChangeNetwork).toHaveBeenCalledWith(networkToSelect.id)
  })

  it("displays the network status indicator for each network", () => {
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

  it("displays the network name and base URL", () => {
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
    const baseUrlElement = within(menuItem).getByText(selectedNetwork.baseUrl)

    expect(nameElement).toBeInTheDocument()
    expect(baseUrlElement).toBeInTheDocument()
  })
})
