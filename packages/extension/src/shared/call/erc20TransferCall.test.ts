import type { Call } from "starknet"
import { describe, expect, test } from "vitest"

import type { Erc20TransferCall } from "./erc20TransferCall"
import {
  isErc20TransferCall,
  parseErc20TransferCall,
} from "./erc20TransferCall"

/** Typical transfer call - no secrets */

const Erc20TransferCallValid: Erc20TransferCall = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "123",
    "456",
  ],
}

/** The following are invalid variations of the above */

const Erc20TransferCallInvalidAddress: Call = {
  contractAddress: "INVALID",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "123",
    "456",
  ],
}

const Erc20TransferCallInvalidCalldataLength: Call = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "123",
  ],
}

const Erc20TransferCallInvalidRecipientAddress: Call = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: ["INVALID", "123", "456"],
}

const Erc20TransferCallInvalidAmountTooSmall: Call = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "0",
    "0",
  ],
}

const Erc20TransferCallInvalidAmountTooLarge: Call = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "0xfffffffffffffffffffffffffffffffff",
    "0xfffffffffffffffffffffffffffffffff",
  ],
}

const Erc20TransferCallInvalidEntrypoint: Call = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "approve",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "123",
    "456",
  ],
}

describe("erc20transferCall", () => {
  describe("isErc20TransferCall()", () => {
    describe("when valid", () => {
      test("returns true when Call is ERC20 transfer", () => {
        expect(isErc20TransferCall(Erc20TransferCallValid)).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("returns false when contract address is invalid", () => {
        expect(isErc20TransferCall(Erc20TransferCallInvalidAddress)).toBeFalsy()
      })
      test("returns false when calldata is wrong length", () => {
        expect(
          isErc20TransferCall(Erc20TransferCallInvalidCalldataLength),
        ).toBeFalsy()
      })
      test("returns false when recipient address is invalid", () => {
        expect(
          isErc20TransferCall(Erc20TransferCallInvalidRecipientAddress),
        ).toBeFalsy()
      })
      test("returns false when amount is invalid", () => {
        expect(
          isErc20TransferCall(Erc20TransferCallInvalidAmountTooSmall),
        ).toBeFalsy()
      })
      test("returns false when amount is too large", () => {
        expect(
          isErc20TransferCall(Erc20TransferCallInvalidAmountTooLarge),
        ).toBeFalsy()
      })
      test("returns false when method is invalid", () => {
        expect(
          isErc20TransferCall(Erc20TransferCallInvalidEntrypoint),
        ).toBeFalsy()
      })
    })
  })
  describe("parseErc20TransferCall()", () => {
    describe("when valid", () => {
      test("parses contractAddress, recipientAddress, and amount", () => {
        expect(parseErc20TransferCall(Erc20TransferCallValid)).toEqual({
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          recipientAddress:
            "0x0470007FC2B04c3bB560a55f70F3EA005A4C1D46F970B9561428553cF6D6120E",
          amount: "155168759315947939339298820988886304424059",
        })
      })
    })
    describe("when invalid", () => {
      test("throws error", () => {
        expect(() =>
          parseErc20TransferCall(
            Erc20TransferCallInvalidEntrypoint as Erc20TransferCall,
          ),
        ).toThrow()
      })
    })
  })
})
