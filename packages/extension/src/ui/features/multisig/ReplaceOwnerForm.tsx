import { FieldError, P2 } from "@argent/x-ui"
import { Box, Flex, Input, InputGroup, Spinner } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

import type { FieldValuesReplaceOwnerForm } from "./hooks/useReplaceOwnerForm"
import { useEffect } from "react"

export const ReplaceOwnerForm = ({
  signerToRemove,
  newLedgerSigner,
  isReplaceWithLedger,
}: {
  signerToRemove: string
  newLedgerSigner?: string
  isReplaceWithLedger?: boolean
}) => {
  const {
    formState: { errors },
    register,
  } = useFormContext<FieldValuesReplaceOwnerForm>()

  useEffect(() => {
    if (isReplaceWithLedger && newLedgerSigner)
      register(`signerKey` as const, {
        required: true,
        value: newLedgerSigner,
      })
  })

  return (
    <Flex direction="column" justifyContent="space-between" w="100%">
      <Box maxHeight={300} overflowY="auto">
        <Box mt="2" width="100%">
          <P2 mb="2" ml="2">
            Current owner
          </P2>
          <InputGroup display="flex" alignItems="center">
            <Input disabled={true} placeholder={signerToRemove} />
          </InputGroup>
        </Box>

        <Box mb="2" mt="4" width="100%">
          <P2 mb="2" ml="2">
            New owner
          </P2>
          <InputGroup display="flex" alignItems="center">
            <Input
              isInvalid={Boolean(errors?.name)}
              placeholder="Name"
              {...register(`name` as const, {
                required: false,
              })}
              mb={2}
            />
          </InputGroup>
          {!newLedgerSigner && !isReplaceWithLedger && (
            <InputGroup display="flex" alignItems="center">
              <Input
                isInvalid={Boolean(errors?.signerKey)}
                placeholder="Signer pubkey..."
                {...register(`signerKey` as const, {
                  required: true,
                })}
              />
            </InputGroup>
          )}
          {isReplaceWithLedger && (
            <InputGroup display="flex" alignItems="center">
              <Input
                placeholder={
                  newLedgerSigner || "Assigning Ledger signer pubkey..."
                }
                disabled={true}
                value={newLedgerSigner}
                position="relative"
                _placeholder={{ opacity: 1 }}
                _disabled={{ bg: "surface-elevated", opacity: 1 }}
                color="neutrals.300"
                fontSize="16px"
                fontWeight="600"
                lineHeight="20px"
                border="none"
                _hover={{ border: "none" }}
              />
              {!newLedgerSigner && (
                <Spinner position="absolute" top="5" right="5" size="sm" />
              )}
            </InputGroup>
          )}
        </Box>
      </Box>
      {errors.signerKey?.message && (
        <FieldError>{errors.signerKey?.message}</FieldError>
      )}
    </Flex>
  )
}
