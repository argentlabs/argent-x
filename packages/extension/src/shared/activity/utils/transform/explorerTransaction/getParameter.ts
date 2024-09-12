import { isArray } from "lodash-es"

import { IExplorerTransactionParameters } from "../../../../explorer/type"

export const getParameter = (
  parameters: IExplorerTransactionParameters[] | undefined,
  name: string,
) => {
  if (!isArray(parameters)) {
    return
  }
  const parameter = parameters.find((parameter) => parameter.name === name)
  if (parameter && parameter.value) {
    return parameter.value
  }
}
