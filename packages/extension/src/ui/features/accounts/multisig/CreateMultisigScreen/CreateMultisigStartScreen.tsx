import { P3 } from "@argent/ui"
import { Box, Button, Center, Divider } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import styled from "styled-components"
import { z } from "zod"

import { StyledControlledInput } from "../../../../components/InputText"
import { FormError } from "../../../../theme/Typography"
import { useSignerKey } from "../useSignerKey"
import { CreateMultisigScreen } from "."

const formSchema = z
  .object({
    signerKeys: z
      .object({
        key: z.string().regex(/^[a-zA-Z0-9]{43}$/, "Incorrect signer key"),
      })
      .array(),
    confirmations: z
      .number()
      .min(1, "You need at least one confirmation")
      .default(1),
  })
  .refine((data) => data.confirmations <= data.signerKeys.length, {
    message: "Confirmations should be less than or equal to signer keys",
    path: ["confirmations"],
  })

type FieldValues = z.infer<typeof formSchema>

export const CreateMultisigStartScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    register,
  } = useForm<FieldValues>({
    criteriaMode: "firstError",
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  })
  const { encodedPubKey, pubKey } = useSignerKey()

  const { fields, append } = useFieldArray({
    name: "signerKeys",
    control,
  })
  return (
    <CreateMultisigScreen
      subtitle="Ask your co-owners to go to “Join existing multisig” in Argent X and send you their signer key"
      currentIndex={0}
      title="Add owners"
    >
      <P3 textColor={"primary"}>A signer key is NOT an account address</P3>
      <Divider color="neutrals.700" my="4" />
      <Box my="2" width="100%">
        <P3 mb="1">Owner 1 (Me)</P3>
        <StyledControlledInput
          placeholder={encodedPubKey}
          {...register(`signerKeys.-1.key` as const, {
            required: true,
            value: encodedPubKey,
          })}
          control={control}
          disabled={true}
          value={encodedPubKey}
          className={errors?.signerKeys?.[-1]?.key ? "error" : ""}
        />
      </Box>
      {fields.map((field, index) => {
        return (
          <Box key={field.id} my="2" width="100%">
            <P3 mb="1">Owner {index + 2}</P3>
            <StyledControlledInput
              placeholder="Signer key..."
              {...register(`signerKeys.${index}.key` as const, {
                required: true,
              })}
              control={control}
              className={errors?.signerKeys?.[index]?.key ? "error" : ""}
            />
            {errors.signerKeys && (
              <FormError>{errors.signerKeys?.[index]?.key?.message}</FormError>
            )}
          </Box>
        )
      })}
      <Center width="100%">
        <Button variant="link" onClick={() => append({ key: "" })} size="xs">
          + Add another owner
        </Button>
      </Center>
      <Button colorScheme="primary">Next</Button>
    </CreateMultisigScreen>
  )
}
