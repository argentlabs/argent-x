import { num, uint256 } from "starknet"

export const uint256ToHexString = (felt: string[]) => {
  const [low, high] = felt
  const bn = uint256.uint256ToBN({ low, high })
  return num.toHex(bn)
}
