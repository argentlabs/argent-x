import { MessageType } from "../../messages"
import type { ActionHash, ActionQueueItem } from "../schema"

/** Extract the 'data' type of each item in the union if it exists */
type ExtractDataType<Type> = Type extends { data: any } ? Type["data"] : never

/** A union of the 'data' part of each MessageType */
type MessageDataType = ExtractDataType<MessageType>

export interface IActionService {
  approve(action: ActionQueueItem | ActionHash): Promise<void>
  approveAndWait(
    action: ActionQueueItem | ActionHash,
  ): Promise<MessageDataType | undefined>
  reject(actionHash: ActionHash | ActionHash[]): Promise<void>
  rejectAll(): Promise<void>
}
