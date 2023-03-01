import { render } from "@testing-library/react"

import TextWithAmount from "."

describe("TextWithAmount", () => {
  it("renders the child component with alt attribute equal to the amount prop as a number", () => {
    const amount = 42
    const { getByText } = render(
      <TextWithAmount amount={amount}>
        <h1>This is some text with an amount</h1>
      </TextWithAmount>,
    )
    const childComponent = getByText("This is some text with an amount")

    expect(childComponent).toHaveAttribute("alt", String(amount))
  })

  it("renders the child component with alt attribute equal to the amount prop as a string", () => {
    const amount = "10,000"
    const { getByText } = render(
      <TextWithAmount amount={amount}>
        <h1>This is some text with an amount</h1>
      </TextWithAmount>,
    )
    const childComponent = getByText("This is some text with an amount")

    expect(childComponent).toHaveAttribute("alt", amount)
  })

  it("renders the child component with alt attribute equal to the amount prop as a really large number", () => {
    const amount = 1234567890
    const { getByText } = render(
      <TextWithAmount amount={amount}>
        <h2>This is some text with an amount</h2>
      </TextWithAmount>,
    )
    const childComponent = getByText("This is some text with an amount")

    expect(childComponent).toHaveAttribute("alt", String(amount))
  })
})
