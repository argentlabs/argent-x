import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { pubkeySchema } from "../../../../shared/multisig/multisig.model"

const FormSchema = z.object({
  signerKey: pubkeySchema,
})

export type FieldValuesReplaceOwnerForm = z.infer<typeof FormSchema>

export const useReplaceOwnerForm = () => {
  return useForm<FieldValuesReplaceOwnerForm>({
    resolver: zodResolver(FormSchema),
  })
}
