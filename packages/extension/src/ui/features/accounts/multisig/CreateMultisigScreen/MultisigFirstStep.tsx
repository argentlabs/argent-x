import { P3 } from "@argent/ui"
import { icons } from "@argent/ui"
import {
  Box,
  Button,
  ButtonProps,
  Center,
  Circle,
  Divider,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { StyledControlledInput } from "../../../../components/InputText"
import { FormError } from "../../../../theme/Typography"
import { useSignerKey } from "../useSignerKey"
import { ScreenLayout } from "./ScreenLayout"
import { FieldValues } from "./useCreateMultisigForm"

const { CloseIcon } = icons

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
            <InputGroup display="flex" alignItems="center">
              <StyledControlledInput
                placeholder="Signer key..."
                {...register(`signerKeys.${index}.key` as const, {
                  required: true,
                })}
                control={control}
                className={errors?.signerKeys?.[index]?.key ? "error" : ""}
              />
              <InputRightElement my="auto">
                <RoundButton onClick={() => remove(index)}>
                  <CloseIcon />
                </RoundButton>
              </InputRightElement>
            </InputGroup>
            {errors.signerKeys && (
              <FormError>{errors.signerKeys?.[index]?.key?.message}</FormError>
            )}
          </Box>
        )
      })}
      {errors.signerKeys?.message && (
        <FormError>{errors.signerKeys?.message}</FormError>
      )}
      <Center width="100%">
        <Button variant="link" onClick={() => append({ key: "" })} size="xs">
          + Add another owner
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

const RoundButton = ({ onClick, children }: ButtonProps) => {
  return (
    <Button
      onClick={onClick}
      height="5"
      size="xs"
      mr="2"
      my="0"
      mt="0.5em"
      pb="0"
      variant="link"
    >
      <Circle
        backgroundColor="neutrals.800"
        p="0.5em"
        _hover={{
          backgroundColor: "neutrals.600",
        }}
      >
        {children}
      </Circle>
    </Button>
  )
}
