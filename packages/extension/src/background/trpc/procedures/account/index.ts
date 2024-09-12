import { getLastUsedOnNetworkProcedure } from "./getLastUsedOnNetwork"
import { router } from "../../trpc"
import { createAccountProcedure } from "./create"
import { deployAccountProcedure } from "./deploy"
import { selectAccountProcedure } from "./select"
import { upgradeAccountProcedure } from "./upgrade"

export const accountRouter = router({
  create: createAccountProcedure,
  deploy: deployAccountProcedure,
  upgrade: upgradeAccountProcedure,
  select: selectAccountProcedure,
  getLastUsedOnNetwork: getLastUsedOnNetworkProcedure,
})
