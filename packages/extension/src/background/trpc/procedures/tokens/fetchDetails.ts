import { extensionOnlyProcedure } from "../permissions"
import {
  BaseTokenSchema,
  RequestTokenSchema,
} from "../../../../shared/token/__new/types/token.model"
import { tokenService } from "../../../../shared/token/__new/service"

export const fetchDetailsProcedure = extensionOnlyProcedure
  .input(BaseTokenSchema)
  .output(RequestTokenSchema)
  .query(async ({ input: baseToken }) => {
    return tokenService.fetchTokenDetails(baseToken)
  })
