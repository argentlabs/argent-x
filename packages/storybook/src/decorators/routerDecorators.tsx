import { Preview } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export const decorators: Preview["decorators"] = [
  (Story) => (
    <MemoryRouter initialEntries={["/"]}>
      <Story />
    </MemoryRouter>
  ),
]
