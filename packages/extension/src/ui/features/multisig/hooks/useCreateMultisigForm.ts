import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { accountMessagingService } from "../../../services/accountMessaging"
import { getBaseMultisigAccounts } from "../../../../shared/multisig/utils/baseMultisig"
import { encodeBase58Array } from "@argent/x-shared"
import { pubkeySchema } from "../../../../shared/multisig/multisig.model"

export const confirmationsSchema = z
  .number()
  .positive()
  .min(1, "You need at least one confirmation")
  .default(1)

const getFormSchema = (accountSignerKey?: string, isNewMultisig = true) =>
  z
    .object({
      signerKeys: z
        .object({
          key: pubkeySchema,
          name: z.string().optional(),
        })
        .array()
        .min(isNewMultisig ? 0 : 1, "You need at least one signer")
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
        )
        .refine(
          (arr) => {
            const nonEmptyNames = arr.map((item) => item.name).filter(Boolean)
            const uniqueValues = new Set(
              nonEmptyNames.map((name) => name?.toLowerCase()),
            )
            return uniqueValues.size === nonEmptyNames.length
          },
          {
            message: "You cannot use the same name twice",
          },
        ),
      confirmations: confirmationsSchema,
    })
    .refine(
      async (data) => {
        const baseMultisigs = await getBaseMultisigAccounts()

        const bufferedPubKeys =
          await accountMessagingService.getPublicKeysBufferForMultisig(
            0,
            baseMultisigs.length + 10, // We get 10 more to be sure we have enough
          )

        const encodedBufferedPubKeys = encodeBase58Array(bufferedPubKeys)

        const currentSigners = data.signerKeys.map((signer) => signer.key)

        const signerIsInSameMultisig = currentSigners.some((signer) =>
          encodedBufferedPubKeys.includes(signer),
        )

        return !signerIsInSameMultisig
      },
      {
        message: "You cannot add signer pubkeys from the same Argent X wallet",
        path: ["signerKeys"],
      },
    )
    // We increment by 1 to include the owner
    .refine((data) => data.confirmations <= data.signerKeys.length + 1, {
      message: "Confirmations should be less than or equal to signer pubkeys",
      path: ["confirmations"],
    })

export type FieldValuesCreateMultisigForm = z.infer<
  ReturnType<typeof getFormSchema>
>

export const CreateMultisigFormSchema = (
  accountSignerKey?: string,
  isNewMultisig = true,
) => getFormSchema(accountSignerKey, isNewMultisig)

export const useCreateMultisigForm = (accountSignerKey?: string) => {
  return useForm<FieldValuesCreateMultisigForm>({
    resolver: zodResolver(getFormSchema(accountSignerKey), {
      async: true,
    }),
  })
}
