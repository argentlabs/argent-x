import { isEmpty, isString } from "lodash-es"

/** Failure reason: 0x496e73756666696369656e7420746f6b656e73207265636569766564 ('Insufficient tokens received'). */
const rpcErrorRegex = /(0x[a-fA-F0-9]+)\s*\('(.*?)'\)/

export const getPrettyRpcError = (errorString?: string) => {
  if (!isString(errorString)) {
    return
  }
  const match = errorString.match(rpcErrorRegex)
  if (match && !isEmpty(match[2])) {
    return match[2]
  }
}
