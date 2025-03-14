import { getMessage } from "@extend-chrome/messages"
import type { SendOptions } from "@extend-chrome/messages/types/types"
import { map } from "rxjs"
import type { MessageType } from "./types"

const [_sendMessage, _messageStream, _waitForMessage] =
  getMessage<MessageType>("ARGENTX")

export function sendMessage(
  data: MessageType,
  options?: SendOptions | undefined,
) {
  // remove all functions from the message object
  // as they cannot be sent over the message bus (and make firefox crash)
  const cleanMessage = JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "function") return undefined
      if (typeof value === "bigint")
        return { __type: "bigint", value: value.toString() }
      return value
    }),
  )

  return _sendMessage(cleanMessage, options)
}

function parseMessage(
  msg: [MessageType, chrome.runtime.MessageSender],
): [MessageType, chrome.runtime.MessageSender] {
  const payload: unknown = msg?.[0]
  if (typeof payload === "object" && payload !== null) {
    const parsedMsg: MessageType = JSON.parse(
      JSON.stringify(payload),
      (_, v: unknown) => {
        if (
          typeof v === "object" &&
          v !== null &&
          "__type" in v &&
          "value" in v
        ) {
          if (v.__type === "bigint" && typeof v.value === "string") {
            return BigInt(v.value)
          }
        }
        return v
      },
    )
    return [parsedMsg, ...msg.slice(1)] as [
      MessageType,
      chrome.runtime.MessageSender,
    ]
  }
  return msg
}
// reexpose messageStream to allow message parsing for bigint, parse the above message

export const messageStream = _messageStream.pipe(map(parseMessage))

export async function waitForMessage<
  K extends MessageType["type"],
  T extends { type: K } & MessageType,
>(
  type: K,
  predicate: (x: T) => boolean = () => true,
): Promise<T extends { data: infer S } ? S : undefined> {
  return _waitForMessage(([msg]: any) => msg.type === type && predicate(msg))
    .then((m: any) => parseMessage(m))
    .then(
      ([msg]) =>
        ("data" in msg ? msg.data : undefined) as T extends { data: infer S }
          ? S
          : undefined,
    )
}
