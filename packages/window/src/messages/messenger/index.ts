interface BaseMessage {
  id: string
  meta?: Record<string, unknown>
}

export interface RequestMessage extends BaseMessage {
  type: "REQUEST"
  method: string
  args: unknown[]
}

export interface ResponseResultMessage extends BaseMessage {
  type: "RESPONSE"
  result: unknown
}

export interface ResponseErrorMessage extends BaseMessage {
  type: "RESPONSE"
  error: unknown
}

export type ResponseMessage = ResponseResultMessage | ResponseErrorMessage

export type Message = RequestMessage | ResponseMessage

export type Listener = (message: Message, origin: string) => void

export interface Messenger {
  postMessage(message: Message): void
  addListener(listener: Listener): void
  removeListener(listener: Listener): void
}
