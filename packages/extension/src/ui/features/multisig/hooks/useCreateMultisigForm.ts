import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const confirmationsSchema = z
  .number()
  .positive()
  .min(1, "You need at least one confirmation")
  .default(1)

const getFormSchema = (accountSignerKey?: string) =>
  z
    .object({
      signerKeys: z
        .object({
          key: z.string().regex(/^[a-zA-Z0-9]{43}$/, "Incorrect signer key"),
        })
        .array()
        .min(1, "You need at least one co-owner")
        .refine(
          (arr) => {
            const extendedArr = accountSignerKey
              ? [...arr.map((item) => item.key), accountSignerKey]
              : arr.map((item) => item.key)
            const uniqueValues = new Set(extendedArr)

            return uniqueValues.size === extendedArr.length
          },
          {
            message: "You cannot use the same key twice",
          },
        ),
      confirmations: confirmationsSchema,
    })
    // We increment by 1 to include the owner
    .refine((data) => data.confirmations <= data.signerKeys.length + 1, {
      message: "Confirmations should be less than or equal to signer keys",
      path: ["confirmations"],
    })

export type FieldValuesCreateMultisigForm = z.infer<
  ReturnType<typeof getFormSchema>
>

export const useCreateMultisigForm = (accountSignerKey?: string) => {
  return useForm<FieldValuesCreateMultisigForm>({
    resolver: zodResolver(getFormSchema(accountSignerKey)),
  })
}
