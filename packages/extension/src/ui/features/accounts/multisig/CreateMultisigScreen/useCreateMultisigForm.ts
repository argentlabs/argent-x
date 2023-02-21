import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z
  .object({
    signerKeys: z
      .object({
        key: z.string().regex(/^[a-zA-Z0-9]{43}$/, "Incorrect signer key"),
      })
      .array()
      .min(1, "You need at least one co-owner"),
    confirmations: z
      .number()
      .positive()
      .min(1, "You need at least one confirmation")
      .default(1),
  })
  // We increment by 1 to include the owner
  .refine((data) => data.confirmations <= data.signerKeys.length + 1, {
    message: "Confirmations should be less than or equal to signer keys",
    path: ["confirmations"],
  })

export type FieldValues = z.infer<typeof formSchema>

export const useCreateMultisigForm = () => {
  return useForm<FieldValues>({
    resolver: zodResolver(formSchema),
  })
}
