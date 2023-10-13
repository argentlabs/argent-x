import { Token } from "../../../../../shared/token/__new/types/token.model"
import { getFeeToken } from "../../../../../shared/token/__new/utils"

export const feeToken = getFeeToken("goerli-alpha") as Token
