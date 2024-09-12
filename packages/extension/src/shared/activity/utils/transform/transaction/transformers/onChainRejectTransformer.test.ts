import { Transaction } from "../../../../../transactions"
import { SignerType } from "../../../../../wallet.model"
import { TransformedTransaction } from "../../type"
import onChainRejectTransformer from "./onChainRejectTransformer"

const mockTransaction: Transaction = {
  account: {
    name: "Account",
    type: "multisig",
    network: {
      id: "sepolia-alpha",
      name: "Sepolia",
      chainId: "SN_SEPOLIA",
      rpcUrl: "",
      possibleFeeTokenAddresses: ["0x123"],
    },
    signer: {
      derivationPath: "m/44'/9004'/1'/0/0",
      type: SignerType.LOCAL_SECRET,
    },
    address: "0x123",
    networkId: "SN_SEPOLIA",
  },
  meta: {
    transactions: [
      {
        calldata: [
          "0x123",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ],
        contractAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "transfer",
      },
    ],
  },
  timestamp: 1717077788236,
  status: {
    finality_status: "NOT_RECEIVED",
  },
  hash: "0x0760d2c00bfe3c89424f3afbb260385dc5c2bc5dca3da6355624f424949bef5e",
}
const mockResult: TransformedTransaction = {
  action: "TRANSFER",
  entity: "TOKEN",
  date: "+056382-01-10T09:38:25.000Z",
  displayName: "Transfer",
  fromAddress:
    "0x29605b4328be06e96d746f5e441f484ab17b6579827ebad56ff065de4a7c5ca",
  toAddress:
    "0x0675F57C39e23F8b750BEE308F2dF150989668664F27aeCe2049751CBf6E8280",
  amount: "100000000000000",
  tokenAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
}
const mockAccountAddress = "0x123"

describe("onChainRejectTransformer", () => {
  it("should return the correct result", () => {
    const result = onChainRejectTransformer({
      transaction: mockTransaction,
      result: mockResult,
      accountAddress: mockAccountAddress,
    })

    expect(result).toEqual({
      ...mockResult,
      action: "REJECT_ON_CHAIN",
      displayName: "On-chain rejection",
    })
  })

  it("should not transform if incorrect sender", () => {
    const result = onChainRejectTransformer({
      transaction: mockTransaction,
      result: mockResult,
      accountAddress: "0x456",
    })

    expect(result).toBeUndefined()
  })
})
