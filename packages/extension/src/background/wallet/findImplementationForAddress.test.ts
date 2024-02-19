import { test } from "vitest"
import {
  findImplementationForAccount,
  getAccountDeploymentPayload,
  getAccountContractAddress,
  Implementation,
} from "./findImplementationForAddress"
import { WalletAccount } from "../../shared/wallet.model"
import { ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES } from "../../shared/account/starknet.constants"
import { STANDARD_DEVNET_ACCOUNT_CLASS_HASH } from "../../shared/network/constants"

const validCairoVersion = "1"
const validAccountClassHash =
  "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003"
const validPubKey =
  "0x79c1b964b5c2996ca1ba107616e0c3a9b671d488b696886606270dc5784e131"
const validAddress = // confirmed inside AX
  "0xb9209b483a8f0b75ea6244827f66227f619e9dc055b18b16b26732c76dbd9d"

describe("findImplementationForAccount", () => {
  test("with invalid address", () => {
    const invalidAddress = "0x456"
    const account: Pick<
      WalletAccount,
      "address" | "classHash" | "cairoVersion"
    > = {
      address: invalidAddress,
      classHash: validAccountClassHash,
      cairoVersion: validCairoVersion,
    }
    const additionalImplementations: Implementation[] = []

    expect(() =>
      findImplementationForAccount(
        validPubKey,
        account,
        additionalImplementations,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[AccountError: Calculated address does not match account address]`,
    )
  })

  test("with invalid pubkey", () => {
    const invalidPubkey = "0xinvalid"
    const account: Pick<
      WalletAccount,
      "address" | "classHash" | "cairoVersion"
    > = {
      address: "0x456",
      classHash: validAccountClassHash,
      cairoVersion: validCairoVersion,
    }
    const additionalImplementations: Implementation[] = []

    expect(() =>
      findImplementationForAccount(
        invalidPubkey,
        account,
        additionalImplementations,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[SyntaxError: Cannot convert 0xinvalid to a BigInt]`,
    )
  })

  test("with no additional implementations", () => {
    const account: Pick<
      WalletAccount,
      "address" | "classHash" | "cairoVersion"
    > = {
      address: validAddress,
      classHash: validAccountClassHash,
      cairoVersion: validCairoVersion,
    }

    const result = findImplementationForAccount(validPubKey, account)
    expect(result).toMatchInlineSnapshot(`
      {
        "accountClassHash": "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
        "cairoVersion": "1",
      }
    `)
  })

  test("with additional implementations", () => {
    const invalidCairoVersion = "0"
    const invalidAddress =
      "0x5663ac1c17abd6cb78c09b160e409f9c6acfeff368c3c3a61e458f1d5c6dfd4"
    const invalidImplementation: Implementation = {
      accountClassHash: validAccountClassHash,
      cairoVersion: invalidCairoVersion,
    }
    const account: Pick<
      WalletAccount,
      "address" | "classHash" | "cairoVersion"
    > = {
      address: invalidAddress,
      classHash: validAccountClassHash,
      cairoVersion: invalidCairoVersion,
    }
    const additionalImplementations: Implementation[] = [invalidImplementation]

    const result = findImplementationForAccount(
      validPubKey,
      account,
      additionalImplementations,
    )
    expect(result).toEqual(additionalImplementations[0])
  })
})

describe("getAccountDeploymentPayload", () => {
  const pubKey = "0x123"

  test("when cairoVersion is 1 and accountClassHash is CAIRO_1[0]", () => {
    const cairoVersion = "1"
    const accountClassHash = ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_1[0]

    const result = getAccountDeploymentPayload(
      cairoVersion,
      accountClassHash,
      pubKey,
    )

    expect(result).toMatchInlineSnapshot(`
      {
        "addressSalt": "0x123",
        "classHash": "0x29927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b",
        "constructorCalldata": [
          "291",
          "0",
        ],
      }
    `)
  })

  test("when cairoVersion is 0 and accountClassHash is CAIRO_0[0]", () => {
    const cairoVersion = "0"
    const accountClassHash = ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_0[0]

    const result = getAccountDeploymentPayload(
      cairoVersion,
      accountClassHash,
      pubKey,
    )

    expect(result).toMatchInlineSnapshot(`
      {
        "addressSalt": "0x123",
        "classHash": "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
        "constructorCalldata": [
          "1449178161945088530446351771646113898511736767359683664273252560520029776866",
          "215307247182100370520050591091822763712463273430149262739280891880522753123",
          "2",
          "291",
          "0",
        ],
      }
    `)
    // Add your assertions here
  })

  test("when cairoVersion is 1 and accountClassHash is STANDARD_DEVNET_ACCOUNT_CLASS_HASH", () => {
    const cairoVersion = "1"
    const accountClassHash = STANDARD_DEVNET_ACCOUNT_CLASS_HASH

    const result = getAccountDeploymentPayload(
      cairoVersion,
      accountClassHash,
      pubKey,
    )

    expect(result).toMatchInlineSnapshot(`
      {
        "addressSalt": "0x123",
        "classHash": "0x4d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f",
        "constructorCalldata": [
          "291",
        ],
      }
    `)
  })
})

describe("getAccountContractAddress", () => {
  test("valid AX account", () => {
    const result = getAccountContractAddress(
      validCairoVersion,
      validAccountClassHash,
      validPubKey,
    )

    expect(result).toEqual(validAddress)
  })
  test("bugged account C0", () => {
    const result = getAccountContractAddress(
      "0",
      validAccountClassHash,
      validPubKey,
    )

    expect(result).toMatchInlineSnapshot(
      `"0x5663ac1c17abd6cb78c09b160e409f9c6acfeff368c3c3a61e458f1d5c6dfd4"`,
    )
  })
})
