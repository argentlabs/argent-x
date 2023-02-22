import { FieldError, P3, RoundButton, icons } from "@argent/ui"
import {
  Box,
  Button,
  Center,
  Divider,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { useSignerKey } from "../useSignerKey"
import { ScreenLayout } from "./ScreenLayout"
import { FieldValues } from "./useCreateMultisigForm"

const { CloseIcon, AddIcon } = icons

export const MultisigFirstStep = ({
  index,
  goNext,
}: {
  index: number
  goNext: () => void
}) => {
  const {
    control,
    formState: { errors },
    register,
    trigger,
  } = useFormContext<FieldValues>()
  const { encodedPubKey } = useSignerKey()
  const { fields, append, remove } = useFieldArray({
    name: "signerKeys",
    control,
  })
  const handleNavigationToConfirmationScreen = () => {
    trigger("signerKeys").then((isValid) => {
      if (isValid) {
        goNext()
      }
    })
  }

  return (
    <ScreenLayout
      subtitle="Ask your co-owners to go to “Join existing multisig” in Argent X and send you their signer key"
      currentIndex={index}
      title="Add owners"
    >
      <P3 color="primary.400">A signer key is NOT an account address</P3>
      <Divider color="neutrals.700" my="4" />
      <Box my="2" width="100%">
        <P3 mb="1">Owner 1 (Me)</P3>
        <Input
          placeholder={encodedPubKey}
          {...register(`signerKeys.-1.key` as const, {
            required: true,
            value: encodedPubKey,
          })}
          disabled={true}
          value={encodedPubKey}
        />
      </Box>
      {fields.map((field, index) => {
        return (
          <Box key={field.id} my="2" width="100%">
            <P3 mb="1">Owner {index + 2}</P3>
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
          onClick={() => append({ key: "" })}
          size="xs"
          leftIcon={<AddIcon />}
        >
          Add another owner
        </Button>
      </Center>
      <Button
        colorScheme="primary"
        onClick={handleNavigationToConfirmationScreen}
      >
        Next
      </Button>
    </ScreenLayout>
  )
}
