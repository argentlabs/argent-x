import { BarBackButton, NavigationContainer } from "@argent/ui"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: NavigationContainer,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    title: "Title in here",
    leftButton: <BarBackButton />,
  },
}
