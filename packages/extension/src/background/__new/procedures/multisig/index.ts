import { router } from "../../trpc"
import { addAccountProcedure } from "./addAccount"
import { addOwnerProcedure } from "./addOwner"
import { removeOwnerProcedure } from "./removeOwner"
import { updateThresholdProcedure } from "./updateThreshold"
import { deployProcedure } from "./deploy"
import { addPendingAccountProcedure } from "./addPendingAccount"
import { addTransactionSignatureProcedure } from "./addTransactionSignature"
import { replaceOwnerProcedure } from "./replaceOwner"

export const multisigRouter = router({
  addAccount: addAccountProcedure,
  addPendingAccount: addPendingAccountProcedure,
  addOwner: addOwnerProcedure,
  removeOwner: removeOwnerProcedure,
  replaceOwner: replaceOwnerProcedure,
  updateThreshold: updateThresholdProcedure,
  deploy: deployProcedure,
  addTransactionSignature: addTransactionSignatureProcedure,
})
