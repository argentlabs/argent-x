/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fireEvent, render, screen } from "@testing-library/react"

import { Network } from "../../../../shared/network"
import { AddNetworkScreen, AddNetworkScreenProps } from "./AddNetworkScreen"
import { ETH_TOKEN_ADDRESS } from "../../../../shared/network/constants"

const network: Network = {
  id: "networkId",
  name: "Ethereum",
  chainId: "chainId",
  explorerUrl: "https://etherscan.io",
  blockExplorerUrl: "https://blockchair.com/ethereum",
  rpcUrl: "https://mainnet.infura.io/v3/123456-RPC",
  possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
}

describe("AddNetworkScreen", () => {
  const onSubmit = vi.fn()
  const onReject = vi.fn()
  const props: AddNetworkScreenProps = {
    requestedNetwork: network,
    onSubmit,
    onReject,
  }

  beforeEach(() => {
    render(<AddNetworkScreen {...props} />)
  })

  it("should render network information", () => {
    expect(screen.getByText("Network ID")).toBeInTheDocument()
    expect(screen.getByDisplayValue(network.id)).toBeInTheDocument()
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByDisplayValue(network.name)).toBeInTheDocument()
    expect(screen.getByText("Chain ID")).toBeInTheDocument()
    expect(screen.getByDisplayValue(network.chainId)).toBeInTheDocument()
    expect(screen.getByText("Explorer URL")).toBeInTheDocument()
    expect(screen.getByDisplayValue(network.explorerUrl!)).toBeInTheDocument()
    expect(screen.getByText("Explorer redirect URL")).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(network.blockExplorerUrl!),
    ).toBeInTheDocument()
    expect(screen.getByText("RPC URL")).toBeInTheDocument()
    expect(screen.getByDisplayValue(network.rpcUrl!)).toBeInTheDocument()
  })

  it("should render add network button", async () => {
    expect(
      await screen.findByRole("button", { name: "Add Network" }),
    ).toBeInTheDocument()
  })

  it("should render reject button", () => {
    expect(screen.getByText("Reject")).toBeInTheDocument()
  })

  it("should call onSubmit when add network button is clicked", () => {
    fireEvent.click(screen.getByTestId("submit-button"))
    expect(onSubmit).toHaveBeenCalled()
  })

  it("should call onReject when reject button is clicked", () => {
    fireEvent.click(screen.getByTestId("reject-button"))
    expect(onReject).toHaveBeenCalled()
  })
})
