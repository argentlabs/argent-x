import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NetworkWarningScreen } from "./NetworkWarningScreen"

describe("NetworkWarningScreen", () => {
  const onClickMock = vi.fn()

  it("renders the warning message and button", () => {
    render(<NetworkWarningScreen onClick={onClickMock} />)
    const titleElement = screen.getByText(/Network issues/i)
    expect(titleElement).toBeInTheDocument()

    const descriptionElement = screen.getByText(
      /Starknet is in Alpha and is experiencing degraded network performance./i,
    )
    expect(descriptionElement).toBeInTheDocument()

    const buttonElement = screen.getByRole("button", { name: /I understand/i })
    expect(buttonElement).toBeInTheDocument()
  })

  it("calls the onClick function when the button is clicked", async () => {
    render(<NetworkWarningScreen onClick={onClickMock} />)
    const buttonElement = screen.getByRole("button", { name: /I understand/i })
    await userEvent.click(buttonElement)
    expect(onClickMock).toHaveBeenCalled()
  })
})
