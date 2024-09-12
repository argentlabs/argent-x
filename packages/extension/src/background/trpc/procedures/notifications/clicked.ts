import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"

export const notificationClickedProcedure = extensionOnlyProcedure
  .input(z.string())
  .mutation(
    async ({
      input: notificationId,
      ctx: {
        services: { notificationService },
      },
    }) => {
      return notificationService.onNotificationClicked(notificationId)
    },
  )
