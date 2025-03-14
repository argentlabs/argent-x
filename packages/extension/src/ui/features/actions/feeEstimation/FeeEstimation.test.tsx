import { render, screen } from "@testing-library/react"

import {
  feeEstimationFixture1,
  feeEstimationFixture2,
  feeEstimationFixture3,
  feeEstimationFixture4,
  feeEstimationFixture5,
  feeEstimationFixture6,
} from "./__fixtures__"
import { FeeEstimation } from "./FeeEstimation"
import { act } from "react"

vi.mock(
  import("../../accountTokens/tokenPriceHooks"),
  async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      useCurrencyDisplayEnabled: vi.fn().mockReturnValue(false),
      useTokenAmountToCurrencyValue: vi.fn().mockReturnValue(undefined),
    }
  },
)

describe("FeeEstimation", () => {
  it("should render scenario 1 as expected", async () => {
    render(<FeeEstimation {...feeEstimationFixture1} />)
    expect(screen.getByText(/0.00021 ETH/)).toBeInTheDocument()
  })

  it("should render scenario 2 as expected", async () => {
    render(<FeeEstimation {...feeEstimationFixture2} />)

    expect(screen.getByText(/0.000000000000021 ETH/)).toBeInTheDocument()
  })

  it("should render scenario 3 as expected", async () => {
    render(<FeeEstimation {...feeEstimationFixture3} />)

    expect(
      screen.getByText(/Insufficient funds to pay fee/),
    ).toBeInTheDocument()

    expect(screen.getByText(/0.000000000000021 ETH/)).toBeInTheDocument()
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
