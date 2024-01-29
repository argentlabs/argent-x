import { FieldError, P3, RoundButton, icons } from "@argent/ui"
import {
  Box,
  Button,
  Center,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react"
import { useCallback, useEffect } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { FieldValuesCreateMultisigForm } from "./hooks/useCreateMultisigForm"

const { CloseIcon, AddIcon } = icons

interface AddOwnerFormProps {
  nextOwnerIndex: number
  isNewMultisig?: boolean
}

export const AddOwnersForm = ({
  nextOwnerIndex,
  isNewMultisig = true,
}: AddOwnerFormProps) => {
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

  // This allows to add an owner when the form is first rendered (will render two in dev mode)
  useEffect(() => {
    if (fields.length === 0) {
      addOwner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOwner])

  return (
    <Flex direction="column" justifyContent="space-between" w="100%">
      <Box maxHeight={300} overflowY="auto">
        {fields.map((field, index) => {
          return (
            <Box key={field.id} my="2" width="100%">
              <P3 mb="1">Owner {nextOwnerIndex + index}</P3>
              <InputGroup display="flex" alignItems="center">
                <Input
                  isInvalid={Boolean(errors?.signerKeys?.[index]?.key)}
                  placeholder="Signer pubkey..."
                  {...register(`signerKeys.${index}.key` as const, {
                    required: true,
                  })}
                />
                <InputRightElement my="auto">
                  <RoundButton
                    data-testid={`closeButton.${index}`}
                    onClick={() => {
                      if (!isNewMultisig && fields.length === 1) {
                        addOwner()
                      }
                      remove(index)
                    }}
                    height="5"
                    size="xs"
                    mr="2"
                    my="0"
                    pb="0"
                    variant="link"
                  >
                    <CloseIcon />
                  </RoundButton>
                </InputRightElement>
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
          variant="link"
          onClick={addOwner}
          size="xs"
          leftIcon={<AddIcon />}
        >
          Add another owner
        </Button>
      </Center>
    </Flex>
  )
}
