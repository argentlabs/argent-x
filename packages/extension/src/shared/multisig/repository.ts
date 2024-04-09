import { IRepository } from "../storage/__new/interface"
import { BaseMultisigWalletAccount } from "../wallet.model"
import {
  IMultisigBaseWalletRepositary,
  MultisigMetadata,
  PendingMultisig,
} from "./types"
import { ChromeRepository } from "../storage/__new/chrome"
import { isEqualAddress } from "@argent/x-shared"
import browser from "webextension-polyfill"
import { accountsEqual } from "../utils/accountsEqual"
import { pendingMultisigEqual } from "./utils/selectors"

export const pendingMultisigRepo = new ChromeRepository<PendingMultisig>(
  browser,
  {
    areaName: "local",
    namespace: "core:multisig:pending",
    compare: pendingMultisigEqual,
  },
)

export const multisigBaseWalletRepo: IMultisigBaseWalletRepositary =
  new ChromeRepository<BaseMultisigWalletAccount>(browser, {
    areaName: "local",
    namespace: "core:multisig:baseWalletAccounts",
    compare: accountsEqual,
  })

export type IMultisigMetadataRepository = IRepository<MultisigMetadata>
export const multisigMetadataRepo: IMultisigMetadataRepository =
  new ChromeRepository<MultisigMetadata>(browser, {
    areaName: "local",
    namespace: "core:multisig:signerNames",
    compare(a: MultisigMetadata, b: MultisigMetadata) {
      return isEqualAddress(a.multisigPublicKey, b.multisigPublicKey)
    },
  })
