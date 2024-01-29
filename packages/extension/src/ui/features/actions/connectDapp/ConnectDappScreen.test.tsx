import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { renderWithLegacyProviders } from "../../../test/utils"
import { accounts } from "../__fixtures__"
import { ConnectDappScreen, ConnectDappScreenProps } from "./ConnectDappScreen"

describe("ConnectDappScreen", () => {
  const onConnect = vi.fn()
  const onDisconnect = vi.fn()
  const onSelectedAccountChange = vi.fn()

  const props: ConnectDappScreenProps = {
    isConnected: true,
    onConnect,
    onDisconnect,
    accounts,
    selectedAccount: accounts[0],
    host: "http://localhost:3000",
    onSelectedAccountChange,
  }

  beforeEach(async () => {
    await act(async () => {
      return renderWithLegacyProviders(<ConnectDappScreen {...props} />)
    })
  })

  it("should render dapp information", () => {
    const hostName = new URL(props.host).hostname

    expect(screen.getByText(/^Connect to/)).toBeInTheDocument()
    expect(screen.getByText(hostName)).toBeInTheDocument()
  })

  it("should call onConnect when Continue button is clicked", async () => {
    await act(async () => {
      const continueButton = screen.getByText("Continue")
      await waitFor(() => expect(continueButton).toBeEnabled())
      await userEvent.click(continueButton)
    })
    expect(onConnect).toHaveBeenCalled()
  })

  it("should call onDisconnect when Disconnect button is clicked", async () => {
    await act(async () => {
      await userEvent.click(screen.getByText("Disconnect"))
    })
    expect(onDisconnect).toHaveBeenCalled()
  })
})
