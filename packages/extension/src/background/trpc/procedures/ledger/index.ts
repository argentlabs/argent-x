import { router } from "../../trpc"
import { addLedgerAccountsProcedure } from "./addLedgerAccounts"
import { connectProcedure } from "./connect"
import { getLedgerAccountsProcedure } from "./getLedgerAccounts"
import { restoreMultisigProcedure } from "./restoreMultisig"

export const ledgerRouter = router({
  connect: connectProcedure,
  restoreMultisig: restoreMultisigProcedure,
  getLedgerAccounts: getLedgerAccountsProcedure,
  addLedgerAccounts: addLedgerAccountsProcedure,
})
