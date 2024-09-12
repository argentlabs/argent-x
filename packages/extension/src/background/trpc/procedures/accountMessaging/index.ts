import { router } from "../../trpc"
import { getEncryptedPrivateKeyProcedure } from "./getEncryptedPrivateKey"
import { getEncryptedSeedPhraseProcedure } from "./getEncryptedSeedPhrase"
import { changeGuardianProcedure } from "./changeGuardian"
import { cancelEscapeProcedure } from "./cancelEscape"
import { triggerEscapeGuardianProcedure } from "./triggerEscapeGuardian"
import { escapeAndChangeGuardianProcedure } from "./escapeAndChangeGuardian"
import { getPublicKeyProcedure } from "./getPublicKey"
import { getNextPublicKeyProcedure } from "./getNextPublicKey"
import { getPublicKeysBufferForMultisigProcedure } from "./getPublicKeysBufferForMultisig"
import { getAccountDeploymentPayloadProcedure } from "./getAccountDeploymentPayload"

export const accountMessagingRouter = router({
  getEncryptedPrivateKey: getEncryptedPrivateKeyProcedure,
  getEncryptedSeedPhrase: getEncryptedSeedPhraseProcedure,
  changeGuardian: changeGuardianProcedure,
  cancelEscape: cancelEscapeProcedure,
  triggerEscapeGuardian: triggerEscapeGuardianProcedure,
  escapeAndChangeGuardian: escapeAndChangeGuardianProcedure,
  getPublicKey: getPublicKeyProcedure,
  getNextPublicKey: getNextPublicKeyProcedure,
  getPublicKeysBufferForMultisig: getPublicKeysBufferForMultisigProcedure,
  getAccountDeploymentPayload: getAccountDeploymentPayloadProcedure,
})
