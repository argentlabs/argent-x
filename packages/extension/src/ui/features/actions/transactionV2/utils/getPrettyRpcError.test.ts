import { getPrettyRpcError } from "./getPrettyRpcError"

describe("getPrettyRpcError", () => {
  describe("when valid", () => {
    it("should return plain text reason", () => {
      expect(
        getPrettyRpcError(
          "Failure reason: 0x496e73756666696369656e7420746f6b656e73207265636569766564 ('Insufficient tokens received').",
        ),
      ).toEqual("Insufficient tokens received")

      expect(
        getPrettyRpcError(
          `reverted: Error in the called contract (0x02f851d8206141e8133dbc778548be29f7d112cee9c6c8132d7f209817f5de3f):\nError at pc=0:15213:\nGot an exception while executing a hint: Custom Hint Error: Execution failed. Failure reason: 0x4e4654206973207374616b6564 ('NFT is staked').\nCairo traceback (most recent call last):\nUnknown location (pc=0:222)\nUnknown location (pc=0:4845)\nUnknown location (pc=0:10647)\n`,
        ),
      ).toEqual("NFT is staked")

      // How to reproduce:
      // Go to your account on starkscan
      // And trigger a “change_signer” just fill out the parameters with something like your address and 0 and 0
      expect(
        getPrettyRpcError(
          `reverted: Error in the called contract (0x011f5fc2a92ac03434a7937fe982f5e5293b65ad438a989c5b78fb8f04a12016):\nError at pc=0:15213:\nGot an exception while executing a hint: Custom Hint Error: Execution failed. Failure reason: 0x617267656e742f696e76616c69642d6f776e65722d736967 ('argent/invalid-owner-sig').\nCairo traceback (most recent call last):\nUnknown location (pc=0:222)\nUnknown location (pc=0:4845)\nUnknown location (pc=0:10647)\n`,
        ),
      ).toEqual("argent/invalid-owner-sig")

      // 1_ Go to Starkscan with your account
      // 2 Trigger “Cancel escape”
      expect(
        getPrettyRpcError(
          `reverted: Error in the called contract (0x011f5fc2a92ac03434a7937fe982f5e5293b65ad438a989c5b78fb8f04a12016):\nError at pc=0:15213:\nGot an exception while executing a hint: Custom Hint Error: Execution failed. Failure reason: 0x617267656e742f696e76616c69642d657363617065 ('argent/invalid-escape').\nCairo traceback (most recent call last):\nUnknown location (pc=0:222)\nUnknown location (pc=0:4845)\nUnknown location (pc=0:10647)\n`,
        ),
      ).toEqual("argent/invalid-escape")
    })
  })
  describe("when invalid", () => {
    it("should return undefined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(getPrettyRpcError()).toBeUndefined()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(getPrettyRpcError(null)).toBeUndefined()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(getPrettyRpcError([])).toBeUndefined()
      expect(getPrettyRpcError("")).toBeUndefined()
      expect(getPrettyRpcError(`0x123 ('')`)).toBeUndefined()
    })
  })
})
