import { getMessage } from "@extend-chrome/messages"
import type { SendOptions } from "@extend-chrome/messages/types/types"

import { IS_DEV } from "../utils/dev"
import { AccountMessage } from "./AccountMessage"
import { ActionMessage } from "./ActionMessage"
import { MiscenalleousMessage } from "./MiscellaneousMessage"
import { MultisigMessage } from "./MultisigMessage"
import { NetworkMessage } from "./NetworkMessage"
import { PreAuthorisationMessage } from "./PreAuthorisationMessage"
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
  | SessionMessage
  | TokenMessage
  | TransactionMessage
  | UdcMessage
  | ShieldMessage
  | MultisigMessage

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}

export const [_sendMessage, messageStream, _waitForMessage] =
  getMessage<MessageType>("ARGENTX")

export function sendMessage(
  data: MessageType,
  options?: SendOptions | undefined,
) {
  // remove all functions from the message object
  // as they cannot be sent over the message bus (and make firefox crash)
  const cleanMessage = JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "function" ? undefined : value,
    ),
  )

  return _sendMessage(cleanMessage, options)
}

export type SendMessage = typeof sendMessage

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

export type WaitForMessage = typeof waitForMessage

if ((<any>window).PLAYWRIGHT || IS_DEV) {
  ;(<any>window).messageStream = messageStream
  ;(<any>window).sendMessage = sendMessage
  ;(<any>window).waitForMessage = waitForMessage
}
