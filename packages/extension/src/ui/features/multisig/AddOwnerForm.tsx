import { FieldError, icons, P2, scrollbarStyleThin } from "@argent/x-ui"
import { Box, Button, Center, Flex, Input, InputGroup } from "@chakra-ui/react"
import { useCallback, useEffect, useRef } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import type { FieldValuesCreateMultisigForm } from "./hooks/useCreateMultisigForm"

const { PlusSecondaryIcon, MinusPrimaryIcon } = icons

interface AddOwnerFormProps {
  nextOwnerIndex: number
  isNewMultisig?: boolean
}

export const AddOwnersForm = ({
  nextOwnerIndex,
  isNewMultisig = true,
}: AddOwnerFormProps) => {
  const didAddOwner = useRef(false)
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<FieldValuesCreateMultisigForm>()

  const { fields, append, remove } = useFieldArray({
    name: "signerKeys",
    control,
  })

  const addOwner = useCallback(() => {
    append({ key: "" })
  }, [append])

  // This allows to add an owner when the form is first rendered
  useEffect(() => {
    if (!didAddOwner.current && fields.length === 0) {
      addOwner()
      didAddOwner.current = true // don't add more than one in dev mode
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOwner])
  return (
    <Flex direction="column" justifyContent="space-between" w="100%">
      <Box maxHeight={300} overflowY="auto" sx={scrollbarStyleThin}>
        {fields.map((field, index) => {
          return (
            <Box
              key={field.id}
              my="2"
              width="100%"
              data-testid={`signerContainer.${index}`}
            >
              <Flex justify="space-between" align="center">
                <P2>Owner {nextOwnerIndex + index}</P2>
                <Button
                  data-testid={`closeButton.${index}`}
                  onClick={() => {
                    if (!isNewMultisig && fields.length === 1) {
                      addOwner()
                    }
                    remove(index)
                  }}
                  width={7}
                  height={7}
                  size="auto"
                  colorScheme="transparent"
                >
                  <MinusPrimaryIcon />
                </Button>
              </Flex>
              <InputGroup display="flex" alignItems="center" mt={3}>
                <Input
                  isInvalid={Boolean(errors?.signerKeys?.[index]?.name)}
                  placeholder="Name"
                  {...register(`signerKeys.${index}.name` as const, {
                    required: false,
                  })}
                  mb={2}
                />
              </InputGroup>
              <InputGroup display="flex" alignItems="center">
                <Input
                  isInvalid={Boolean(errors?.signerKeys?.[index]?.key)}
                  placeholder="Signer pubkey..."
                  {...register(`signerKeys.${index}.key` as const, {
                    required: true,
                  })}
                />
              </InputGroup>
              {errors.signerKeys && (
                <FieldError>
                  {errors.signerKeys?.[index]?.key?.message}
                </FieldError>
              )}
            </Box>
          )
        })}
      </Box>
      {errors.signerKeys?.message && (
        <FieldError>{errors.signerKeys?.message}</FieldError>
      )}
      <Center width="100%">
        <Button
          data-testid="addOwnerButton"
          size={"sm"}
          colorScheme={"transparent"}
          leftIcon={<PlusSecondaryIcon />}
          color="text-secondary"
          onClick={addOwner}
        >
          Add another owner
        </Button>
      </Center>
    </Flex>
  )
}
