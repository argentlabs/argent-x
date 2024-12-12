import type { TypedData } from "starknet"
import { validateSignatureChainId } from "./validateSignatureChainId"
import { getMockWalletAccount } from "../../../test/walletAccount.mock"
import { getMockNetwork } from "../../../test/network.mock"

describe("validateSignatureChainId", () => {
  const selectedAccount = getMockWalletAccount({
    network: {
      ...getMockNetwork({ chainId: "SN_MAIN" }),
    },
  })

  test("should return success true when chainIds match", () => {
    const typedData = {
      domain: {
        chainId: "SN_MAIN",
      },
    } as unknown as TypedData

    const result = validateSignatureChainId(selectedAccount, typedData)
    expect(result).toEqual({ success: true })
  })

  test("should return success false when chainIds do not match", () => {
    const typedData = {
      domain: {
        chainId: "SN_SEPOLIA",
      },
    } as unknown as TypedData

    const result = validateSignatureChainId(selectedAccount, typedData)
    expect(result).toEqual({
      success: false,
      error:
        "Cannot sign the message from a different chainId. Expected 0x534e5f4d41494e, got 0x534e5f5345504f4c4941",
    })
  })

  test("should return success true when typedData.domain.chainId is undefined", () => {
    const typedData = {
      domain: {
        // chainId omitted
      },
      // other properties omitted for brevity
    } as unknown as TypedData

    const result = validateSignatureChainId(selectedAccount, typedData)
    expect(result).toEqual({
      success: false,
      error: "Cannot sign the message without chainId",
    })
  })
})
