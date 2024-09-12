export type UINavigatePayload = {
  path: string
}

export type UIShowNotificationPayload = {
  notificationId: string
  iconUrl?: string
  title?: string
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export type UIMessage =
  | {
      type: "HAS_POPUP"
    }
  | {
      type: "CLOSE_POPUP"
    }
  | {
      type: "NAVIGATE"
      payload: UINavigatePayload
    }
  | {
      type: "SHOW_NOTIFICATION"
      payload: UIShowNotificationPayload
    }
