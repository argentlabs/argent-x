import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { noop } from "lodash-es"
import { ComponentProps } from "react"

import { delay } from "../../../../shared/utils/delay"
import {
  combinedFeeEstimationFixture1,
  combinedFeeEstimationFixture2,
  combinedFeeEstimationFixture3,
  combinedFeeEstimationFixture4,
  combinedFeeEstimationFixture5,
  combinedFeeEstimationFixture6,
} from "./__fixtures__"
import { CombinedFeeEstimation } from "./CombinedFeeEstimation"

const renderWithTooltip = async (
  props: ComponentProps<typeof CombinedFeeEstimation>,
) => {
  const result = render(<CombinedFeeEstimation {...props} />)
  const { container } = result
  const tooltipIconElement = container.querySelector(
    `[aria-label^="Information about"]`,
  )
  if (!tooltipIconElement) {
    throw new Error("Tooltip icon not found")
  }
  /** hover the tooltip icon to expose its contents */
  await act(async () => {
    await userEvent.hover(tooltipIconElement)
    await delay(0) /** allows animated hover state to propagate */
  })
  return result
}

describe("CombinedFeeEstimation", () => {
  it("should render scenario 1 as expected", async () => {
    await renderWithTooltip(combinedFeeEstimationFixture1)

    expect(screen.getByText(/(Max 0.0022 ETH)/)).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.00061 ETH/)).toBeInTheDocument()
    expect(
      screen.getByText(/Includes one-time activation fee/),
    ).toBeInTheDocument()

    /** tooltip content */
    expect(
      screen.getByText(/^Network fees are paid to the network/),
    ).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.00069 ETH/)).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.0015 ETH/)).toBeInTheDocument()
  })

  it("should render scenario 2 as expected", async () => {
    await renderWithTooltip(combinedFeeEstimationFixture2)

    expect(screen.getByText(/(Max 0.00000000000022 ETH)/)).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.000000000000061 ETH/)).toBeInTheDocument()
    expect(
      screen.getByText(/Includes one-time activation fee/),
    ).toBeInTheDocument()

    /** tooltip content */
    expect(
      screen.getByText(/^Network fees are paid to the network/),
    ).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.000000000000069 ETH/)).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.00000000000015 ETH/)).toBeInTheDocument()
  })

  it("should render scenario 3 as expected", async () => {
    window.scrollTo = vi.fn(noop)

    await renderWithTooltip(combinedFeeEstimationFixture3)

    expect(
      screen.getByText(/Insufficient funds to pay network fee/),
    ).toBeInTheDocument()

    expect(screen.getByText(/(Max 0.00000000000022 ETH)/)).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.000000000000061 ETH/)).toBeInTheDocument()
    expect(
      screen.getByText(/Includes one-time activation fee/),
    ).toBeInTheDocument()

    /** tooltip content */
    expect(
      screen.getByText(/^Network fees are paid to the network/),
    ).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.000000000000069 ETH/)).toBeInTheDocument()
    expect(screen.getByText(/≈ 0.00000000000015 ETH/)).toBeInTheDocument()

    expect(window.scrollTo).toHaveBeenCalled()
  })

  it("should render scenario 4 as expected", async () => {
    render(<CombinedFeeEstimation {...combinedFeeEstimationFixture4} />)

    expect(
      screen.getByText(/Transaction failure predicted/),
    ).toBeInTheDocument()
  })

  it("should render scenario 5 as expected", async () => {
    render(<CombinedFeeEstimation {...combinedFeeEstimationFixture5} />)

    expect(
      screen.getByText(/Transaction failure predicted/),
    ).toBeInTheDocument()
  })

  it("should render scenario 6 as expected", async () => {
    render(<CombinedFeeEstimation {...combinedFeeEstimationFixture6} />)

    expect(screen.getByText(/Waiting for funds.../)).toBeInTheDocument()
  })
})
