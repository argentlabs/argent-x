import { FieldError, P3, RoundButton, icons } from "@argent/ui"
import {
  Box,
  Button,
  Center,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react"
import { useCallback, useEffect } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { FieldValues } from "./hooks/useCreateMultisigForm"

const { CloseIcon, AddIcon } = icons

export const AddOwnersForm = ({
  nextOwnerIndex,
}: {
  nextOwnerIndex: number
}) => {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<FieldValues>()

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
  }, [addOwner, fields.length])

  return (
    <>
      {fields.map((field, index) => {
        return (
          <Box key={field.id} my="2" width="100%">
            <P3 mb="1">Owner {nextOwnerIndex + index}</P3>
            <InputGroup display="flex" alignItems="center">
              <Input
                isInvalid={Boolean(errors?.signerKeys?.[index]?.key)}
                placeholder="Signer key..."
                {...register(`signerKeys.${index}.key` as const, {
                  required: true,
                })}
              />
              <InputRightElement my="auto">
                <RoundButton
                  onClick={() => remove(index)}
                  height="5"
                  size="xs"
                  mr="2"
                  my="0"
                  mt="1em"
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
      {errors.signerKeys?.message && (
        <FieldError>{errors.signerKeys?.message}</FieldError>
      )}
      <Center width="100%">
        <Button
          variant="link"
          onClick={addOwner}
          size="xs"
          leftIcon={<AddIcon />}
        >
          Add another owner
        </Button>
      </Center>
    </>
  )
}
