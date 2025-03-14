import type { IRepository } from "../storage/__new/interface"
import type { BaseMultisigWalletAccount } from "../wallet.model"
import type {
  IMultisigBaseWalletRepositary,
  MultisigMetadata,
  PendingMultisig,
} from "./types"
import { ChromeRepository } from "../storage/__new/chrome"
import { isEqualAddress } from "@argent/x-shared"

import { accountsEqual } from "../utils/accountsEqual"
import { pendingMultisigEqual } from "./utils/selectors"
import { browserStorage } from "../storage/browser"

export const pendingMultisigRepo = new ChromeRepository<PendingMultisig>(
  browserStorage,
  {
    areaName: "local",
    namespace: "core:multisig:pending",
    compare: pendingMultisigEqual,
  },
)

export const multisigBaseWalletRepo: IMultisigBaseWalletRepositary =
  new ChromeRepository<BaseMultisigWalletAccount>(browserStorage, {
    areaName: "local",
    namespace: "core:multisig:baseWalletAccounts",
    compare: accountsEqual,
  })

export type IMultisigMetadataRepository = IRepository<MultisigMetadata>
export const multisigMetadataRepo: IMultisigMetadataRepository =
  new ChromeRepository<MultisigMetadata>(browserStorage, {
    areaName: "local",
    namespace: "core:multisig:signerNames",
    compare(a: MultisigMetadata, b: MultisigMetadata) {
      return isEqualAddress(a.multisigPublicKey, b.multisigPublicKey)
    },
  })
