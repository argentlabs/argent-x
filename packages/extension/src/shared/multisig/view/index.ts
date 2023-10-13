import { atomFromRepo } from "../../../ui/views/implementation/atomFromRepo"
import { multisigBaseWalletRepo, pendingMultisigRepo } from "../repository"

export const pendingMultisigsView = atomFromRepo(pendingMultisigRepo)

export const multisigBaseWalletView = atomFromRepo(multisigBaseWalletRepo)
