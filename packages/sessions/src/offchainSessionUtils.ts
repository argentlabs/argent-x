import { AccountInterface, Signature } from "starknet"

export type Hex = `0x${string}`

export interface GasFees {
  tokenAddress: Hex
  maximumAmount: {
    low: Hex
    high: Hex
  }
}

export interface OffchainSessionAllowedMethods {
  contractAddress: Hex
  method: string
}

export interface OffchainRequestSession {
  sessionKey: string
  expirationTime: number
  allowedMethods: OffchainSessionAllowedMethods[]
}

export async function createOffchainSession(
  session: OffchainRequestSession,
  account: AccountInterface,
  gasFees: GasFees,
  version = "1",
): Promise<Signature> {
  const { sessionKey, expirationTime, allowedMethods } = session
  const chainId = await account.getChainId()
  const signature = await account.signMessage({
    domain: {
      name: "ArgentSession",
      chainId,
      version,
    },
    types: {
      Session: [
        {
          name: "accountAddress",
          type: "felt",
        },
        {
          name: "sessionKey",
          type: "felt",
        },
        {
          name: "expirationTime",
          type: "felt",
        },
        {
          name: "gasFees",
          type: "TokenSpending",
        },
        {
          name: "allowedMethods",
          type: "AllowedMethod*",
        },
      ],
      TokenSpending: [
        {
          name: "tokenAddress",
          type: "felt",
        },
        {
          name: "maximumAmount",
          type: "u256",
        },
      ],
      AllowedMethod: [
        {
          name: "contractAddress",
          type: "felt",
        },
        {
          name: "method",
          type: "felt",
        },
      ],
      u256: [
        {
          name: "low",
          type: "felt",
        },
        {
          name: "high",
          type: "felt",
        },
      ],
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "chainId", type: "felt" },
        { name: "version", type: "felt" },
      ],
      Message: [{ name: "message", type: "felt" }],
    },
    primaryType: "Session",
    message: {
      accountAddress: account.address,
      sessionKey,
      expirationTime,
      gasFees,
      allowedMethods,
    },
  })

  return signature
}
