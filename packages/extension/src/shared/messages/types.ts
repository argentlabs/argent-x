import type { AccountMessage } from "./AccountMessage"
import type { ActionMessage } from "./ActionMessage"
import type { MiscenalleousMessage } from "./MiscellaneousMessage"
import type { NetworkMessage } from "./NetworkMessage"
import type { PreAuthorizationMessage } from "./PreAuthorisationMessage"
import type { SessionMessage } from "./SessionMessage"
import type { TokenMessage } from "./TokenMessage"
import type { TransactionMessage } from "./TransactionMessage"
import type { UdcMessage } from "./UdcMessage"

export type MessageType =
  | AccountMessage
  | ActionMessage
  | MiscenalleousMessage
  | NetworkMessage
  | PreAuthorizationMessage
  | SessionMessage
  | TokenMessage
  | TransactionMessage
  | UdcMessage

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}
