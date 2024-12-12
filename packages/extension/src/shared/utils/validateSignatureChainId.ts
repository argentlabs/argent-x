import type { TypedData } from "starknet"
import type { WalletAccount } from "../wallet.model"
import { encodeChainId } from "./encodeChainId"

type ValidateSignatureChainIdResult =
  | {
      success: false
      error: string
    }
  | {
      success: true
    }

export const validateSignatureChainId = (
  selectedAccount: WalletAccount,
  typedData: TypedData,
): ValidateSignatureChainIdResult => {
  // let's compare encoded formats of both chainIds
  const encodedDomainChainId = encodeChainId(typedData.domain.chainId)
  const encodedSelectedChainId = encodeChainId(selectedAccount.network.chainId)

  if (!encodedDomainChainId) {
    return { success: false, error: "Cannot sign the message without chainId" }
  }

  if (encodedSelectedChainId !== encodedDomainChainId) {
    return {
      success: false,
      error: `Cannot sign the message from a different chainId. Expected ${encodedSelectedChainId}, got ${encodedDomainChainId}`,
    }
  }

  return { success: true }
}
