import { z } from "zod"
import { avatarMetaSchema } from "../../../shared/wallet.model"

export type LabelVersion = "v1" | "v2"

export const accountLabelDataSchema = avatarMetaSchema.extend({
  // 15 is the max that can be displayed in the UI
  accountName: z.string().min(1).max(15),
})

export type AccountLabelData = z.infer<typeof accountLabelDataSchema>
