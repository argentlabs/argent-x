import { router } from "../../trpc"
import { addAccountProcedure } from "./addAccount"
import { addOffchainSignatureProcedure } from "./addOffchainSignature"
import { addOwnerProcedure } from "./addOwner"
import { addPendingAccountProcedure } from "./addPendingAccount"
import { addTransactionSignatureProcedure } from "./addTransactionSignature"
import { cancelOffchainSignatureProcedure } from "./cancelOffchainSignature"
import { deployProcedure } from "./deploy"
import { rejectOnChainTransactionProcedure } from "./rejectOnChainTransaction"
import { removeOwnerProcedure } from "./removeOwner"
import { replaceOwnerProcedure } from "./replaceOwner"
import { retryTransactionExecutionProcedure } from "./retryTransactionExecution"
import { updateThresholdProcedure } from "./updateThreshold"
import { validateSignersProcedure } from "./validateSigners"
import { waitForOffchainSignaturesProcedure } from "./waitForOffchainSignatures"

export const multisigRouter = router({
  validateSigners: validateSignersProcedure,
  addAccount: addAccountProcedure,
  addPendingAccount: addPendingAccountProcedure,
  addOwner: addOwnerProcedure,
  removeOwner: removeOwnerProcedure,
  replaceOwner: replaceOwnerProcedure,
  updateThreshold: updateThresholdProcedure,
  deploy: deployProcedure,
  addTransactionSignature: addTransactionSignatureProcedure,
  addOffchainSignature: addOffchainSignatureProcedure,
  waitForOffchainSignatures: waitForOffchainSignaturesProcedure,
  cancelOffchainSignature: cancelOffchainSignatureProcedure,
  rejectOnChainTransaction: rejectOnChainTransactionProcedure,
  retryTransactionExecution: retryTransactionExecutionProcedure,
})
