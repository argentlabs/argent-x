interface BaseMessage {
  id: string
  meta?: Record<string, unknown>
}

export interface RequestMessage extends BaseMessage {
  type: "REQ"
  method: string
  args: unknown[]
}

export interface ResponseResultMessage extends BaseMessage {
  type: "RES"
  result: unknown
}

export interface ResponseErrorMessage extends BaseMessage {
  type: "RES"
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
