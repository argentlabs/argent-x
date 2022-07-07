import { getMessage } from "@extend-chrome/messages"
import { SendOptions } from "@extend-chrome/messages/types/types"

import { AccountMessage } from "./AccountMessage"
import { ActionMessage } from "./ActionMessage"
import { MiscenalleousMessage } from "./MiscellaneousMessage"
import { NetworkMessage } from "./NetworkMessage"
import { PreAuthorisationMessage } from "./PreAuthorisationMessage"
import { RecoveryMessage } from "./RecoveryMessage"
import { SessionMessage } from "./SessionMessage"
import { SettingsMessage } from "./SettingsMessage"
import { TokenMessage } from "./TokenMessage"
import { TransactionMessage } from "./TransactionMessage"

export type MessageType =
  | AccountMessage
  | ActionMessage
  | MiscenalleousMessage
  | NetworkMessage
  | PreAuthorisationMessage
  | RecoveryMessage
  | SessionMessage
  | TokenMessage
  | TransactionMessage
  | SettingsMessage

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}

export const [_sendMessage, messageStream, _waitForMessage] =
  getMessage<MessageType>("ARGENTX")

if (
  process.env.NODE_ENV === "development" &&
  process.env.DEBUG_MESSAGING === "true"
) {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
}

export const sendMessage = (message: MessageType, options?: SendOptions) => {
  const x = _sendMessage(message, options)
  if (
    process.env.NODE_ENV === "development" &&
    process.env.DEBUG_MESSAGING === "true"
  ) {
    console.log("Sending message", message)
  }
  return x
}

export async function waitForMessage<
  K extends MessageType["type"],
  T extends { type: K } & MessageType,
>(
  type: K,
  predicate: (x: T) => boolean = () => true,
): Promise<T extends { data: infer S } ? S : undefined> {
  return _waitForMessage(
    ([msg]: any) => msg.type === type && predicate(msg),
  ).then(([msg]: any) => msg.data)
}
