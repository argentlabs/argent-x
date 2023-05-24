import { Empty, EmptyButton, icons } from "@argent/ui"

const { AddIcon } = icons

export default {
  component: Empty,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}

export const WithButton = {
  args: {
    children: <EmptyButton leftIcon={<AddIcon />}>Create account</EmptyButton>,
  },
}
