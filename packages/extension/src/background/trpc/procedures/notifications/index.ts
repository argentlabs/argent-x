import { notificationClickedProcedure } from "./clicked"
import { router } from "../../trpc"

export const notificationsRouter = router({
  notificationClicked: notificationClickedProcedure,
})
