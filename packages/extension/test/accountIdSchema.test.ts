import { stark } from "starknet"
import type { WalletAccountSigner } from "../src/shared/wallet.model"
import { accountIdSchema, SignerType } from "../src/shared/wallet.model"
import { getAccountIdentifier } from "../src/shared/utils/accountIdentifier"

describe("accountIdSchema", () => {
  const mockSigner: WalletAccountSigner = {
    derivationPath: "m/44'/60'/0'/0/0",
    type: SignerType.LOCAL_SECRET,
  }

  it("should validate a correct account identifier", () => {
    const accountId = getAccountIdentifier(
      stark.randomAddress(),
      "1",
      mockSigner,
    )
    expect(() => accountIdSchema.parse(accountId)).not.toThrow()
  })

  it("should invalidate an incorrect account identifier (missing parts)", () => {
    const invalidAccountId = "0x123::1::mockType"
    expect(() => accountIdSchema.parse(invalidAccountId)).toThrow()
  })

  it("should invalidate an incorrect account identifier (wrong format)", () => {
    const invalidAccountId = "0x123-1-mockType-0"
    expect(() => accountIdSchema.parse(invalidAccountId)).toThrow()
  })

  it("should invalidate an incorrect account identifier (non-numeric index)", () => {
    const invalidAccountId = "0x123::1::mockType::abc"
    expect(() => accountIdSchema.parse(invalidAccountId)).toThrow()
  })

  it("should invalidate an incorrect account identifier (invalid characters)", () => {
    const invalidAccountId = "0x123::1::mockType::0$"
    expect(() => accountIdSchema.parse(invalidAccountId)).toThrow()
  })

  it("should support very long indexes", () => {
    const accountId = "0x123::1::mockType::10232345234543535"
    expect(() => accountIdSchema.parse(accountId)).not.toThrow()
  })

  it("should support hyphen in networkId", () => {
    const accountId = getAccountIdentifier(
      stark.randomAddress(),
      "ropsten-alpha",
      mockSigner,
    )
    expect(() => accountIdSchema.parse(accountId)).not.toThrow()
  })

  it("should support underscores in networkId", () => {
    const accountId = getAccountIdentifier(
      stark.randomAddress(),
      "ropsten_alpha",
      mockSigner,
    )
    expect(() => accountIdSchema.parse(accountId)).not.toThrow()
  })

  it("should throw if the address is not in hex format", () => {
    const invalidAccountId = "1234::1::mockType::0"
    expect(() => accountIdSchema.parse(invalidAccountId)).toThrow()
  })

  it("should pass with the following account identifier", () => {
    const accountId =
      "0x015339a610e883a773650eab9d79a10b971a4d8707c9cbeb8d20a7baea1b64ee::sepolia-alpha::local_secret::3"

    expect(() => accountIdSchema.parse(accountId)).not.toThrow()
  })

  it("should throw with undefined account identifier", () => {
    const invalidAccountId = undefined
    expect(() => accountIdSchema.parse(invalidAccountId)).toThrow()
    expect(accountIdSchema.safeParse(invalidAccountId).success).toBe(false)
  })
})
