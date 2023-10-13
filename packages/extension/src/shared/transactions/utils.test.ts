import { getTransactionIdentifier, identifierToBaseTransaction } from "./utils"

describe("Make sure encode and decode to identifier return to the same value", () => {
  test("encode and decode", () => {
    const transaction = {
      hash: "0x01" as const,
      networkId: "net1",
    }
    const identifier = getTransactionIdentifier(transaction)
    expect(identifier).toEqual("net1::0x01")
    const decoded = identifierToBaseTransaction(identifier)
    expect(decoded).toEqual(transaction)
  })
  test("encode and decode with non-byte values", () => {
    const transaction = {
      hash: "0x1" as const,
      networkId: "net1",
    }
    const parsedTransaction = {
      hash: "0x01" as const,
      networkId: "net1",
    }
    const identifier = getTransactionIdentifier(transaction)
    expect(identifier).toEqual("net1::0x01")
    const decoded = identifierToBaseTransaction(identifier)
    expect(decoded).toEqual(parsedTransaction)
  })
})
