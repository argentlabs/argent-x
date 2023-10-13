import { FieldError, P3 } from "@argent/ui"
import { Box, Flex, Input, InputGroup } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

import { FieldValuesReplaceOwnerForm } from "./hooks/useReplaceOwnerForm"

export const ReplaceOwnerForm = ({
  signerToRemove,
}: {
  signerToRemove: string
}) => {
  const {
    formState: { errors },
    register,
  } = useFormContext<FieldValuesReplaceOwnerForm>()

  return (
    <Flex direction="column" justifyContent="space-between" w="100%">
      <Box maxHeight={300} overflowY="auto">
        <Box my="2" width="100%">
          <P3 mb="2" ml={2}>
            Current owner
          </P3>
          <InputGroup display="flex" alignItems="center">
            <Input disabled={true} placeholder={signerToRemove} />
          </InputGroup>
        </Box>

        <Box my="2" width="100%">
          <P3 mb="2" ml={2}>
            New owner
          </P3>
          <InputGroup display="flex" alignItems="center">
            <Input
              isInvalid={Boolean(errors?.signerKey)}
              placeholder="Signer pubkey..."
              {...register(`signerKey` as const, {
                required: true,
              })}
            />
          </InputGroup>
        </Box>
      </Box>
      {errors.signerKey?.message && (
        <FieldError>{errors.signerKey?.message}</FieldError>
      )}
    </Flex>
  )
}
