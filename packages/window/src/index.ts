export * from "get-starknet-core"

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
  CallSchema,
  CallsArraySchema,
  BigNumberishSchema,
} from "./types"
export * from "./utils/mittx"
