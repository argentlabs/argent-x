import { DeclareOrDeployContractSuccessScreen } from "@argent-x/extension/src/ui/features/settings/developerSettings/smartContractDevelopment/DeclareOrDeployContractSuccessScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: DeclareOrDeployContractSuccessScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Declare = {
  args: {
    type: "declare",
    classHashOrDeployedAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  },
}

export const Deploy = {
  args: {
    ...Declare.args,
    type: "deploy",
  },
}
