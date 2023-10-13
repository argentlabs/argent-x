import { DeploySmartContractForm } from "@argent-x/extension/src/ui/features/settings/DeveloperSettings/DeploySmartContractForm"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: DeploySmartContractForm,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
