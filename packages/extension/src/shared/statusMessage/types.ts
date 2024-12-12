export type IStatusMessageLevel = "info" | "warning" | "danger"

export interface IStatusMessage {
  /** the unique ID of this message */
  id: string
  /** the ISO8601 date when this message was last updated */
  updatedAt: string
  /** the minimum app version this message is applicable to (inclusive) */
  minVersion?: string | null
  /** the maximum app version this message is applicable to (inclusive) */
  maxVersion?: string | null
  /** the level of the warning */
  level?: IStatusMessageLevel
  /** whether this message can be dismissed completely by the user */
  dismissable?: boolean
  /** whether this message should initially take over the 'full screen' of the app */
  fullScreen?: boolean
  /** the shortest possible summary, should be understandable without reading 'message' */
  summary?: string
  /** the message in full with all details, or null if there is no message to be displayed */
  message: string | null
  /** the title to display for the link */
  linkTitle?: string
  /** the link url */
  linkUrl?: string
}

export interface IStatusMessageStorage {
  /** last dismissed message id */
  lastDismissedMessageId?: string
  /** for full screen messages whether full screen was closed */
  lastFullScreenMessageClosedId?: string
}
