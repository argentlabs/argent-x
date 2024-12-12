import type { Call } from "starknet"
import { MultisigEntryPointType } from "../multisig/types"
import { ETH_TOKEN_ADDRESS } from "../network/constants"
import type { ReplaceMultisigSignerCall } from "./changeMultisigSignersCall"
import {
  getNewSignerInReplaceMultisigSignerCall,
  isReplaceMultisigSignerCall,
  isReplaceSelfAsSignerInMultisigCall,
} from "./changeMultisigSignersCall"

const SELF_PUB_KEY =
  "0x02b12f420d9a638a516bee76cbd6786d3eca08d9e589e0f293d85472b9036204"
const RANDOM_PUB_KEY =
  "0x07de7b34da32652e524fffe0ed5713b1642524aeea6cb1c2305ff699bf04329f"

describe("changeMultisigSignersCall", () => {
  test("isReplaceMultisigSignerCall should return true for valid call", () => {
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: MultisigEntryPointType.REPLACE_SIGNER,
      calldata: [SELF_PUB_KEY, RANDOM_PUB_KEY],
    }

    expect(isReplaceMultisigSignerCall(call)).toBe(true)
  })

  test("isReplaceSelfAsSignerInMultisigCall should return true for valid call", () => {
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: MultisigEntryPointType.REPLACE_SIGNER,
      calldata: [SELF_PUB_KEY, RANDOM_PUB_KEY],
    }

    expect(isReplaceSelfAsSignerInMultisigCall(call, SELF_PUB_KEY)).toBe(true)
  })

  test("isReplaceSelfAsSignerInMultisigCall should return false for invalid calldata length", () => {
    const selfPubKey = "0x123"
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: MultisigEntryPointType.REPLACE_SIGNER,
      calldata: [SELF_PUB_KEY, RANDOM_PUB_KEY, "0x345"],
    }
    expect(isReplaceSelfAsSignerInMultisigCall(call, selfPubKey)).toBe(false)
  })

  test("isReplaceSelfAsSignerInMultisigCall should return false for invalid selfPubKey", () => {
    const call: Call = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: MultisigEntryPointType.REPLACE_SIGNER,
      calldata: [SELF_PUB_KEY, RANDOM_PUB_KEY, "0x345"],
    }

    expect(isReplaceSelfAsSignerInMultisigCall(call, SELF_PUB_KEY)).toBe(false)
  })

  test("getNewSignerInReplaceMultisigSignerCall should return the correct signer", () => {
    const call: ReplaceMultisigSignerCall = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: MultisigEntryPointType.REPLACE_SIGNER,
      calldata: [SELF_PUB_KEY, RANDOM_PUB_KEY],
    }

    expect(getNewSignerInReplaceMultisigSignerCall(call)).toEqual(
      RANDOM_PUB_KEY,
    )
  })

  test("getNewSignerInReplaceMultisigSignerCall should return undefined for incorrect call", () => {
    const call: ReplaceMultisigSignerCall = {
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: MultisigEntryPointType.REPLACE_SIGNER,
      calldata: [SELF_PUB_KEY, RANDOM_PUB_KEY, "0x345"],
    }

    expect(getNewSignerInReplaceMultisigSignerCall(call)).toBeUndefined()
  })
})
