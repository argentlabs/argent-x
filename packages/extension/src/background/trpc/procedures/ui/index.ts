import { router } from "../../trpc"
import { openUIProcedure } from "./openUI"

export const uiRouter = router({
  openUiAsPopup: openUIProcedure,
})
