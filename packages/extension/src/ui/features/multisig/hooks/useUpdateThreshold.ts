import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const confirmationsSchema = z
  .number()
  .positive()
  .min(1, "You need at least one confirmation")
  .default(1)

const getFormSchema = (signerKeysLength?: number) =>
  z
    .object({
      confirmations: confirmationsSchema,
    })
    .refine(
      (data) => {
        if (signerKeysLength) {
          return data.confirmations <= signerKeysLength + 1
        }
      },
      {
        message: "Confirmations should be less than or equal to signer keys",
        path: ["confirmations"],
      },
    )

export type FieldValuesThresholdForm = z.infer<ReturnType<typeof getFormSchema>>

export const useUpdateThresholdForm = (signerKeysLength?: number) => {
  return useForm<FieldValuesThresholdForm>({
    resolver: zodResolver(getFormSchema(signerKeysLength)),
  })
}
