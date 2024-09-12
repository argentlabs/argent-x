import { FC } from "react"

import { useResetAll } from "../../hooks/useResetAll"
import {
  Box,
  Button,
  Checkbox,
  CheckboxProps,
  Circle,
  Flex,
  Input,
  Text,
} from "@chakra-ui/react"
import {
  FieldError,
  H3,
  P3,
  P4,
  iconsDeprecated,
  useNavigateBack,
} from "@argent/x-ui"
import { Controller, ControllerRenderProps, useForm } from "react-hook-form"
import { isEmpty } from "lodash-es"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"

type ResetWalletFormValues = {
  validationString: string
  understood: boolean
}
const { RestoreIcon } = iconsDeprecated

export const ResetScreen: FC = () => {
  const onCancel = useNavigateBack()
  const resetAll = useResetAll()
  const { control, formState, handleSubmit, watch } =
    useForm<ResetWalletFormValues>()
  const { errors } = formState
  const { validationString, understood } = watch()
  const disabledButton = !validationString || !understood
  const inputRef = useAutoFocusInputRef<HTMLInputElement>()
  const validateInput = (value: string) => {
    return value === "RESET WALLET"
  }
  const submitReset = () => {
    if (isEmpty(errors.validationString)) {
      resetAll(true)
    }
  }
  return (
    <Flex
      flex={1}
      flexDirection={"column"}
      py={6}
      px={5}
      direction="column"
      as="form"
      onSubmit={handleSubmit(submitReset)}
    >
      <Flex flex={1} align="center" flexDirection="column">
        <Circle bg="black" p={4} mt={12} mb={4}>
          <RestoreIcon w={12} h={12} />
        </Circle>
        <H3 my={3}>Reset wallet</H3>
        <P3 color="text-secondary" mb={6} mx={2} textAlign="center">
          Argent does not store your password. You need to reset your wallet.
          Before resetting it is important to{" "}
          <Text as="span" color="text-primary">
            save your 12-word recovery phrase{" "}
          </Text>
          (in Argent X settings) otherwise there is no other way to recover your
          wallet
        </P3>
        <Controller
          name="validationString"
          control={control}
          rules={{ required: true, validate: validateInput }}
          defaultValue=""
          render={({ field: { ref, ...field } }) => (
            <Flex w="fill-available" flexDir="column">
              <Input
                autoComplete="off"
                placeholder={'Type "RESET WALLET"'}
                {...field}
                isInvalid={!isEmpty(errors.validationString)}
                ref={(e) => {
                  ref(e)
                  inputRef.current = e
                }}
              />
              {!isEmpty(errors.validationString) && (
                <Box
                  position="relative"
                  display="flex"
                  justifyContent="flex-start"
                  alignItems={"self-start"}
                  gap="5px"
                  mt="3"
                >
                  {errors.validationString?.type === "validate" && (
                    <FieldError>
                      Make sure to type exactly &quot;RESET WALLET&quot;
                    </FieldError>
                  )}
                  {errors.validationString?.type === "required" && (
                    <FieldError>Confirmation phrase is required</FieldError>
                  )}
                  {errors.validationString?.message && (
                    <FieldError>{errors.validationString.message}</FieldError>
                  )}
                </Box>
              )}
            </Flex>
          )}
        />
      </Flex>
      <Flex direction="column">
        <Controller
          name="understood"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Flex>
              <CheckboxInput color="text-secondary" {...field} />
              <P4 color="text-secondary">
                I understand that if I have not backed up my recovery phrase I
                cannot recover my wallet
              </P4>
            </Flex>
          )}
        />
      </Flex>
      <Flex mt={4} gap={2}>
        <Button w="fill-available" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          colorScheme="danger"
          type="submit"
          w="fill-available"
          isDisabled={disabledButton}
        >
          Reset
        </Button>
      </Flex>
    </Flex>
  )
}

interface CheckboxInputProps
  extends Omit<ControllerRenderProps, "value">,
    Pick<CheckboxProps, "color"> {
  value: boolean
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  // eslint-disable-next-line react/prop-types
  onChange,
  // eslint-disable-next-line react/prop-types
  value,
  ...rest
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Convert string value to boolean before passing it to the original onChange handler
    onChange(event.target.checked)
  }

  return (
    <Checkbox
      {...rest}
      type="checkbox"
      checked={value}
      onChange={handleChange}
      borderColor="text-secondary"
      colorScheme="primary"
      size="md"
      mr={2}
    />
  )
}
