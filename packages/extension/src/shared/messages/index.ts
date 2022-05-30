import { getMessage } from "@extend-chrome/messages"

import { AccountMessage } from "./AccountMessage"
import { ActionMessage } from "./ActionMessage"
import { BackupMessage } from "./BackupMessage"
import { MiscenalleousMessage } from "./MiscenalleousMessage"
import { NetworkMessage } from "./NetworkMessage"
import { PreAuthorisationMessage } from "./PreAuthorisationMessage"
import { SessionMessage } from "./SessionMessage"
import { TokenMessage } from "./TokenMessage"
import { TransactionMessage } from "./TransactionMessage"

export type MessageType =
  | AccountMessage
  | TransactionMessage
  | PreAuthorisationMessage
  | SessionMessage
  | BackupMessage
  | TokenMessage
  | NetworkMessage
  | ActionMessage
  | MiscenalleousMessage

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}

export const [sendMessage, messageStream, _waitForMessage] =
  getMessage<MessageType>("ARGENTX")

export async function waitForMessage<
  K extends MessageType["type"],
  T extends { type: K } & MessageType,
>(
  type: K,
  predicate: (x: T) => boolean = () => true,
): Promise<T extends { data: any } ? T["data"] : undefined> {
  return _waitForMessage(
    ([msg]: any) => msg.type === type && predicate(msg),
  ).then(([msg]: any) => msg.data)
}
