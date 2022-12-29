import { Call } from "starknet"

export const frenslandCalls: Call[] = [
  {
    entrypoint: "Start Game",
    contractAddress:
      "0x0274f30014f7456d36b82728eb655f23dfe9ef0b7e0c6ca827052ab2d01a5d65",
  },
  {
    entrypoint: "Harvest",
    calldata: ["76", "0", "23", "6"],
    contractAddress:
      "0x0274f30014f7456d36b82728eb655f23dfe9ef0b7e0c6ca827052ab2d01a5d65",
  },
  {
    entrypoint: "Repair building",
    calldata: [
      "0x0274f30014f7456d36b82728eb655f23dfe9ef0b7e0c6ca827052ab2d01a5d65",
      "0",
      "24",
      "5",
    ],
    contractAddress:
      "0x0274f30014f7456d36b82728eb655f23dfe9ef0b7e0c6ca827052ab2d01a5d65",
  },
]
