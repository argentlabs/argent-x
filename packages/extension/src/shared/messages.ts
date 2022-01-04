import { getMessage } from "@extend-chrome/messages"

import { MessageType } from "./MessageType"

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
