import {
  HOT_RELOAD_MESSAGE,
  HOT_RELOAD_PORT,
  IS_DEV,
} from "../shared/utils/dev"
import { sendMessage } from "./messageActions"

if (IS_DEV) {
  const ws = new WebSocket(`ws://localhost:${HOT_RELOAD_PORT}`)
  ws.addEventListener("message", (event) => {
    if (event.data === HOT_RELOAD_MESSAGE) {
      sendMessage({ type: HOT_RELOAD_MESSAGE })
    }
  })
}
