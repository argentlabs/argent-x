import { isERC20TransferCall } from "../src/shared/call"

const ERC20TransferCall = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "10000000000000",
    "0",
  ],
}

const ERC20TransferCallInvalidAddress = {
  contractAddress: "INVALID",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "10000000000000",
    "0",
  ],
}

const ERC20TransferCallInvalidCalldataLength = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "10000000000000",
  ],
}

const ERC20TransferCallInvalidRecipientAddress = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: ["INVALID", "10000000000000", "0"],
}

const ERC20TransferCallInvalidAmount = {
  contractAddress:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  entrypoint: "transfer",
  calldata: [
    "2007141710004580612847837172790366058109710402280793820610123055421682225678",
    "-1",
    "0",
  ],
}

describe("call", () => {
  describe("isERC20TransferCall()", () => {
    describe("when valid", () => {
      test("returns true when Call is ERC20 transfer", () => {
        expect(isERC20TransferCall(ERC20TransferCall)).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("returns false when contract address is invalid", () => {
        expect(isERC20TransferCall(ERC20TransferCallInvalidAddress)).toBeFalsy()
      })
      test("returns false when calldata is wrong length", () => {
        expect(
          isERC20TransferCall(ERC20TransferCallInvalidCalldataLength),
        ).toBeFalsy()
      })
      test("returns false when recipient address is invalid", () => {
        expect(
          isERC20TransferCall(ERC20TransferCallInvalidRecipientAddress),
        ).toBeFalsy()
      })
      test("returns false when amount is invalid", () => {
        expect(isERC20TransferCall(ERC20TransferCallInvalidAmount)).toBeFalsy()
      })
    })
  })
})
