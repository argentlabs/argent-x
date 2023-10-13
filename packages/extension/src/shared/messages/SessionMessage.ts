export type SessionMessage =
  | { type: "STOP_SESSION" }
  | { type: "LOADING_PROGRESS"; data: number }
