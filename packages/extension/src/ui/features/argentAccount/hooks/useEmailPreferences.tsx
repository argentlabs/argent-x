import useSWR from "swr"
import { argentAccountService } from "../../../services/argentAccount"
import { preferencesToEmailPreferences } from "../../../services/argentAccount/utils"

// Discussed with @Janek, agreed that this is a good use case for SWR
export const useEmailPreferences = () =>
  useSWR("preferences", async () => {
    return preferencesToEmailPreferences.parse(
      await argentAccountService.getPreferences(),
    )
  })
