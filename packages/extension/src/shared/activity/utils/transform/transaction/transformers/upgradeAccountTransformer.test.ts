import { describe, it, expect } from "vitest"
import { Transaction } from "../../../../../transactions"
import { SignerType } from "../../../../../wallet.model"
import { TransformedTransaction } from "../../type"
import upgradeAccountTransformer from "./upgradeAccountTransformer"
import { Call } from "starknet"

const mockTransaction: Transaction = {
  account: {
    address:
      "0x07059f14f63fe428f802520078965ead76fbe8693d1f7bd88de74a887cccf418",
    cairoVersion: "1",
    classHash:
      "0x0737ee2f87ce571a58c6c8da558ec18a07ceb64a6172d5ec46171fbc80077a48",
    name: "Multisig 9",
    needsDeploy: false,
    network: {
      accountClassHash: {
        multisig:
          "0x6e150953b26271a740bf2b6e9bca17cc52c68d765f761295de51ceb8526ee72",
        smart:
          "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f",
        standard:
          "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f",
        standardCairo0:
          "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
      },
      chainId: "SN_SEPOLIA",
      explorerUrl: "https://sepolia.voyager.online",
      id: "sepolia-alpha",
      l1ExplorerUrl: "https://sepolia.etherscan.io",
      multicallAddress:
        "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
      name: "Sepolia",
      possibleFeeTokenAddresses: [
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      ],
      readonly: true,
      rpcUrl: "https://api.hydrogen.argent47.net/v1/starknet/sepolia/rpc/v0.7",
    },
    networkId: "sepolia-alpha",
    signer: {
      derivationPath: "m/44'/9004'/1'/0/8",
      type: SignerType.LOCAL_SECRET,
    },
    type: "multisig",
  },
  hash: "0x07b1cd0fa0ebf7421a967e435e55d0195d0c89db1bca7acc0ed551d76d320534",
  meta: {
    transactions: [
      {
        calldata: [
          "0x06e150953b26271a740bf2b6e9bca17cc52c68d765f761295de51ceb8526ee72",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ],
        contractAddress:
          "0x07059f14f63fe428f802520078965ead76fbe8693d1f7bd88de74a887cccf418",
        entrypoint: "upgrade",
      },
    ] as Call[],
    type: "INVOKE",
  },
  status: {
    finality_status: "ACCEPTED_ON_L2",
  },
  timestamp: 1720448308,
}
const mockResult: TransformedTransaction = {
  action: "UPGRADE",
  entity: "CONTRACT",
  date: "2024-07-08T14:18:28.000Z",
  displayName: "Upgrade account",
  newClassHash:
    "0x06e150953b26271a740bf2b6e9bca17cc52c68d765f761295de51ceb8526ee72",
}

describe("upgradeAccountTransformer", () => {
  it("should return the correct result", () => {
    const result = upgradeAccountTransformer({
      transaction: mockTransaction,
      result: mockResult,
    })

    expect(result).toEqual(mockResult)
  })

  it("should not transform if not upgrade", () => {
    // Need this check, otherwise compiling will fail
    let txCall: Call
    if (Array.isArray(mockTransaction?.meta?.transactions)) {
      txCall = mockTransaction.meta.transactions[0]
    } else {
      txCall = mockTransaction?.meta?.transactions as Call
    }
    const result = upgradeAccountTransformer({
      transaction: {
        ...mockTransaction,
        meta: {
          ...mockTransaction.meta,
          transactions: [
            {
              ...txCall,
              entrypoint: "transfer",
            },
          ],
        },
      },
      result: mockResult,
    })

    expect(result).toBeUndefined()
  })

  it("should transform with correct classhash", () => {
    const newClassHash =
      "0x1111111111111111111111111111111111111111111111111111111111111111"

    // Need this check, otherwise compiling will fail
    let txCall: Call
    if (Array.isArray(mockTransaction?.meta?.transactions)) {
      txCall = mockTransaction.meta.transactions[0]
    } else {
      txCall = mockTransaction?.meta?.transactions as Call
    }
    const result = upgradeAccountTransformer({
      transaction: {
        ...mockTransaction,
        meta: {
          ...mockTransaction.meta,
          transactions: [
            {
              ...txCall,
              calldata: [
                newClassHash,
                "0x0000000000000000000000000000000000000000000000000000000000000000",
              ],
            },
          ],
        },
      },
      result: mockResult,
    })

    expect(result).toEqual({
      ...mockResult,
      newClassHash,
    })
  })
})
