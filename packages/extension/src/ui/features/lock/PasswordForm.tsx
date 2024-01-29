import { FieldError, Input, icons } from "@argent/ui"
import { Box, Flex, FlexProps, Text } from "@chakra-ui/react"
import { isEmpty, isString } from "lodash-es"
import { FC, ReactNode, useEffect } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"

import { validatePassword } from "../recovery/seedRecovery.state"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"

interface FieldValues {
  password: string
}

export interface PasswordFormProps extends Omit<FlexProps, "children"> {
  error?: string
  verifyPassword: (password: string) => Promise<boolean>
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
}

export const PasswordForm: FC<PasswordFormProps> = ({
  error,
  verifyPassword,
  children,
  ...rest
}) => {
  const { control, formState, handleSubmit, clearErrors, setError } =
    useForm<FieldValues>()
  const { errors, isDirty, isSubmitting } = formState
  const { InfoIcon } = icons

  useEffect(() => {
    if (isString(error)) {
      setError("password", { message: error })
    }
  }, [error, setError])

  const handlePassword: SubmitHandler<FieldValues> = async (
    { password },
    e,
  ) => {
    e?.preventDefault()
    clearErrors("password")
    const isValid = await verifyPassword(password)
    if (!isValid) {
      setError("password", { message: "Invalid password" })
    }
  }

  const inputRef = useAutoFocusInputRef<HTMLInputElement>()

  return (
    <Flex
      as="form"
      direction="column"
      onSubmit={handleSubmit(handlePassword)}
      {...rest}
    >
      <Controller
        name="password"
        control={control}
        rules={{ required: true, validate: validatePassword }}
        defaultValue=""
        render={({ field: { ref, ...field } }) => (
          <Input
            placeholder="Password"
            type="password"
            {...field}
            isInvalid={!isEmpty(errors.password)}
            ref={(e) => {
              ref(e)
              inputRef.current = e
            }}
          />
        )}
      />
      {!isEmpty(errors.password) && (
        <Box
          position="relative"
          display="flex"
          justifyContent="flex-start"
          gap="5px"
          mt="3"
        >
          <Text fontSize="sm" color="error.500">
            <InfoIcon />
          </Text>
          {errors.password?.type === "validate" && (
            <FieldError>Password is too short</FieldError>
          )}
          {errors.password?.type === "required" && (
            <FieldError>Password is required</FieldError>
          )}
          {errors.password?.message && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Box>
      )}
      {children?.({ isDirty, isSubmitting })}
    </Flex>
  )
}
