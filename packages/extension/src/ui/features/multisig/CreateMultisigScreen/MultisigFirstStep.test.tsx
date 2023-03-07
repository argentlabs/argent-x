import { fireEvent, render, screen } from "@testing-library/react"

import { MultisigFirstStep } from "./MultisigFirstStep"

test("renders the MultisigFirstStep component", () => {
  vi.mock("react-hook-form", async () => {
    const actual = await vi.importActual("react-hook-form")
    return {
      ...(actual as object),
      useFormContext: vi.fn(() => {
        return {
          control: undefined,
          formState: { errors: [] },
          register: vi.fn(() => undefined),
          trigger: vi.fn(() => Promise.resolve(true)),
        }
      }),
      useFieldArray: vi.fn(() => {
        return {
          append: () => undefined,
          remove: () => undefined,
          fields: [{ key: "" }],
        }
      }),
    }
  })

  const goNext = () => undefined
  describe("it should allow to add owners", () => {
    render(<MultisigFirstStep index={0} goNext={goNext} />)
    // Assert that the title and subtitle are rendered
    expect(screen.getByText("Add owners")).toBeInTheDocument()
    expect(
      screen.getByText(/Ask your co-owners to go to “Join existing multisig”/i),
    ).toBeInTheDocument()

    // Assert that the inputs are rendered and have the correct labels
    expect(screen.getByText("Owner 1 (Me)")).toBeInTheDocument()

    // Click the "Add another owner" button
    const addOwnerButton = screen.getByText("Add another owner")
    fireEvent.click(addOwnerButton)

    // Fill out the owner 2 input with a valid value
    const owner2Input = screen.getByPlaceholderText("Signer key...")
    expect(owner2Input).not.toBeNull()
  })
  describe("it should match the snapshots", () => {
    const { container } = render(
      <MultisigFirstStep index={0} goNext={goNext} />,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
