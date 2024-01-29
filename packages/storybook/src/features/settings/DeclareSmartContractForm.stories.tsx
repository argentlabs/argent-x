import { DeclareSmartContractForm } from "@argent-x/extension/src/ui/features/settings/developerSettings/smartContractDevelopment/DeclareSmartContractForm"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: DeclareSmartContractForm,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
