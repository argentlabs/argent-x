import { InvokeFunctionResponse, Signature } from "starknet"
import { z } from "zod"

const callSchema = z.object({
  contractAddress: z.string(),
  entrypoint: z.string(),
  calldata: z.array(z.string()).optional(),
})

const bignumberishSchema = z.union([
  z.string().regex(/^0x[0-9a-fA-F]+$/),
  z.number(),
  z.bigint(),
])

export const typedDataSchema = z.object({
  types: z.record(
    z.array(
      z.union([
        z.object({
          name: z.string(),
          type: z.string(),
        }),
        z.object({
          name: z.string(),
          type: z.literal("merkletree"),
          contains: z.string(),
        }),
      ]),
    ),
  ),
  primaryType: z.string(),
  domain: z.record(z.unknown()),
  message: z.record(z.unknown()),
})

export const StarknetMethodArgumentsSchemas = {
  enable: z
    .tuple([
      z.object({
        starknetVersion: z.union([z.literal("v3"), z.literal("v4")]).optional(),
      }),
    ])
    .or(z.tuple([])),
  addStarknetChain: z.tuple([
    z.object({
      id: z.string(),
      chainId: z.string(),
      chainName: z.string(),
      rpcUrls: z.array(z.string()).optional(),
      nativeCurrency: z
        .object({
          name: z.string(),
          symbol: z.string(),
          decimals: z.number(),
        })
        .optional(),
      blockExplorerUrls: z.array(z.string()).optional(),
    }),
  ]),
  switchStarknetChain: z.tuple([
    z.object({
      chainId: z.string(),
    }),
  ]),
  watchAsset: z.tuple([
    z.object({
      type: z.literal("ERC20"),
      options: z.object({
        address: z.string(),
        symbol: z.string().optional(),
        decimals: z.number().optional(),
        image: z.string().optional(),
        name: z.string().optional(),
      }),
    }),
  ]),
  execute: z.tuple([
    z.array(callSchema).nonempty().or(callSchema),
    z.array(z.any()).optional(),
    z
      .object({
        nonce: bignumberishSchema.optional(),
        maxFee: bignumberishSchema.optional(),
        version: bignumberishSchema.optional(),
      })
      .optional(),
  ]),
  signMessage: z.tuple([typedDataSchema]),
} as const

export type StarknetMethods = {
  enable: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.enable>
  ) => Promise<string[]>
  addStarknetChain: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.addStarknetChain>
  ) => Promise<boolean>
  switchStarknetChain: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.switchStarknetChain>
  ) => Promise<boolean>
  watchAsset: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.watchAsset>
  ) => Promise<boolean>
  execute: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.execute>
  ) => Promise<InvokeFunctionResponse>
  signMessage: (
    ...args: z.infer<typeof StarknetMethodArgumentsSchemas.signMessage>
  ) => Promise<Signature>

  getLoginStatus: () => Promise<
    | { isLoggedIn: false }
    | { isLoggedIn: true; hasSession: boolean; isPreauthorized: boolean }
  >
}

export type ConnectMethods = {
  connect: () => void
}

export type ModalMethods = {
  shouldShow: () => void
  shouldHide: () => void
  heightChanged: (height: number) => void
}

export type WebWalletMethods = ConnectMethods & ModalMethods

export type IframeMethods = {
  connect: () => void
}
