export * from "get-starknet-core"
export { Permission } from "get-starknet-core"

export type { StarknetWindowObject as OldStarknetWindowObject } from "get-starknet-coreV3"

export type {
  GetArgentStarknetWindowObject,
  Variant,
  WebWalletStarknetWindowObject,
  BackwardsCompatibleConnectedStarknetWindowObject,
  BackwardsCompatibleStarknetWindowObject,
} from "./starknet"
export type {
  StarknetMethods,
  IframeMethods,
  WebWalletMethods,
  ConnectMethods,
  ModalMethods,
  OffchainSessionDetails,
} from "./types"
export type {
  Listener,
  Message,
  Messenger,
  RequestMessage,
  ResponseErrorMessage,
  ResponseMessage,
  ResponseResultMessage,
} from "./messages/messenger"

export { MessageAccount } from "./account"

export { getArgentStarknetWindowObject } from "./starknet"
export { WindowMessenger } from "./messages/messenger/window"
export { Sender, Receiver } from "./messages/exchange/bidirectional"
export { Relayer } from "./messages/exchange/relayer"
export {
  StarknetMethodArgumentsSchemas,
  CallsArraySchema,
  BigNumberishSchema,
  RpcCallSchema,
  RpcCallsArraySchema,
  typedDataSchema,
  StarknetExecuteBackwardCompatibleArgumentsSchemas,
  AddStarknetChainParametersSchema,
  /* OffchainSessionDetailsSchema, */
} from "./types"
export * from "./utils/mittx"
