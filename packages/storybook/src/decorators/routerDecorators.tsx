import { Preview } from "@storybook/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"

export const decorators: Preview["decorators"] = [
  (Story) => (
    <MemoryRouter initialEntries={["/"]}>
      <Story />
    </MemoryRouter>
  ),
]

export const accountAddressDecorators: Preview["decorators"] = [
  (Story) => (
    <MemoryRouter initialEntries={["/test/0x123"]}>
      <Routes>
        <Route path="/test/:accountAddress" element={<Story />} />
      </Routes>
    </MemoryRouter>
  ),
]
