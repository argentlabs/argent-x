import { router } from "../../trpc"
import { getEncryptedPrivateKeyProcedure } from "./getEncryptedPrivateKey"
import { getEncryptedSeedPhraseProcedure } from "./getEncryptedSeedPhrase"
import { changeGuardianProcedure } from "./changeGuardian"
import { cancelEscapeProcedure } from "./cancelEscape"
import { triggerEscapeGuardianProcedure } from "./triggerEscapeGuardian"
import { escapeAndChangeGuardianProcedure } from "./escapeAndChangeGuardian"
import { getPublicKeyProcedure } from "./getPublicKey"
import { getNextPublicKeyForMultisigProcedure } from "./getNextPublicKeyForMultisig"
import { getPublicKeysBufferForMultisigProcedure } from "./getPublicKeysBufferForMultisig"

export const accountMessagingRouter = router({
  getEncryptedPrivateKey: getEncryptedPrivateKeyProcedure,
  getEncryptedSeedPhrase: getEncryptedSeedPhraseProcedure,
  changeGuardian: changeGuardianProcedure,
  cancelEscape: cancelEscapeProcedure,
  triggerEscapeGuardian: triggerEscapeGuardianProcedure,
  escapeAndChangeGuardian: escapeAndChangeGuardianProcedure,
  getPublicKey: getPublicKeyProcedure,
  getNextPublicKeyForMultisig: getNextPublicKeyForMultisigProcedure,
  getPublicKeysBufferForMultisig: getPublicKeysBufferForMultisigProcedure,
})
