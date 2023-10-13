import { router } from "../../trpc"

import { getConstructorParamsProcedure } from "./getConstructorParams"

export const udcRouter = router({
  getConstructorParams: getConstructorParamsProcedure,
})
