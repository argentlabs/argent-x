import { render, screen } from "@testing-library/react"
import { noop } from "lodash-es"

import {
  feeEstimationFixture1,
  feeEstimationFixture2,
  feeEstimationFixture3,
  feeEstimationFixture4,
  feeEstimationFixture5,
  feeEstimationFixture6,
} from "./__fixtures__"
import { FeeEstimation } from "./FeeEstimation"

describe("FeeEstimation", () => {
  it("should render scenario 1 as expected", async () => {
    render(<FeeEstimation {...feeEstimationFixture1} />)

    expect(screen.getByText(/(Max 0.00084 ETH)/)).toBeInTheDocument()
    expect(screen.getByText(/0.00021 ETH/)).toBeInTheDocument()
  })

  it("should render scenario 2 as expected", async () => {
    render(<FeeEstimation {...feeEstimationFixture2} />)

    expect(screen.getByText(/(Max 0.000000000000084 ETH)/)).toBeInTheDocument()
    expect(screen.getByText(/0.000000000000021 ETH/)).toBeInTheDocument()
  })

  it("should render scenario 3 as expected", async () => {
    window.scrollTo = vi.fn(noop)

    render(<FeeEstimation {...feeEstimationFixture3} />)

    expect(
      screen.getByText(/Insufficient funds to pay network fee/),
    ).toBeInTheDocument()

    expect(screen.getByText(/(Max 0.000000000000084 ETH)/)).toBeInTheDocument()
    expect(screen.getByText(/0.000000000000021 ETH/)).toBeInTheDocument()

    expect(window.scrollTo).toHaveBeenCalled()
  })

  it("should render scenario 4 as expected", async () => {
    render(<FeeEstimation {...feeEstimationFixture4} />)

    expect(
      screen.getByText(/Transaction failure predicted/),
    ).toBeInTheDocument()
  })

  it("should render scenario 5 as expected", async () => {
    render(<FeeEstimation {...feeEstimationFixture5} />)

    expect(
      screen.getByText(/Transaction failure predicted/),
    ).toBeInTheDocument()
  })

  it("should render scenario 6 as expected", async () => {
    render(<FeeEstimation {...feeEstimationFixture6} />)

    expect(screen.getByText(/Waiting for funds.../)).toBeInTheDocument()
  })
})
