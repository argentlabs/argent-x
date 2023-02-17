import { getMessage } from "@extend-chrome/messages"

import { IS_DEV } from "../utils/dev"
import { AccountMessage } from "./AccountMessage"
import { ActionMessage } from "./ActionMessage"
import { MiscenalleousMessage } from "./MiscellaneousMessage"
import { NetworkMessage } from "./NetworkMessage"
import { PreAuthorisationMessage } from "./PreAuthorisationMessage"
import { RecoveryMessage } from "./RecoveryMessage"
import { SessionMessage } from "./SessionMessage"
import { ShieldMessage } from "./ShieldMessage"
import { TokenMessage } from "./TokenMessage"
import { TransactionMessage } from "./TransactionMessage"
import { UdcMessage } from "./UdcMessage"

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
  | UdcMessage
  | ShieldMessage

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}

export const [_sendMessage, messageStream, _waitForMessage] =
  getMessage<MessageType>("ARGENTX")

export function sendMessage<T extends MessageType>(message: T) {
  // remove all functions from the message object
  // as they cannot be sent over the message bus (and make firefox crash)
  const cleanMessage = JSON.parse(
    JSON.stringify(message, (_, value) =>
      typeof value === "function" ? undefined : value,
    ),
  )

  return _sendMessage(cleanMessage)
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

if ((<any>window).PLAYWRIGHT || IS_DEV) {
  ;(<any>window).messageStream = messageStream
  ;(<any>window).sendMessage = sendMessage
  ;(<any>window).waitForMessage = waitForMessage
}
