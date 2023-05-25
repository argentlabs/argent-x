import { parsedDefaultTokens } from "@argent-x/extension/src/shared/token/utils"
import { AddTokenScreen } from "@argent-x/extension/src/ui/features/actions/AddTokenScreen"

import { decorators } from "../../decorators/routerDecorators"

const token = parsedDefaultTokens[0]

export default {
  component: AddTokenScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}

export const ValidAddress = {
  args: {
    tokenSymbol: token.symbol,
    tokenAddress: token.address,
    tokenName: token.name,
    tokenDecimals: token.decimals,
    validAddress: true,
  },
}

export const Error = {
  args: {
    ...ValidAddress.args,
    error: "Lorem ipsum dolor",
  },
}

export const Loading = {
  args: {
    ...ValidAddress.args,
    loading: true,
    disableSubmit: true,
  },
}
