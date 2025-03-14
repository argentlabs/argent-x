import { InfoCircleSecondaryIcon, BackupPrimaryIcon } from "@argent/x-ui/icons"
import { FieldError } from "@argent/x-ui"
import type { FlexProps } from "@chakra-ui/react"
import {
  Box,
  Flex,
  InputGroup,
  InputRightElement,
  Text,
  Input,
} from "@chakra-ui/react"
import { isEmpty, isString } from "lodash-es"
import type { FC, ReactNode } from "react"
import { useEffect } from "react"
import type { SubmitHandler } from "react-hook-form"
import { Controller, useForm } from "react-hook-form"

import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import useCapsLockStatus from "../../hooks/useCapsLockStatus"

interface FieldValues {
  password: string
}

export interface PasswordFormProps extends Omit<FlexProps, "children"> {
  error?: string
  verifyPassword: (password: string) => Promise<boolean>
  /** If true, the input will auto-focus immediately, otherwise it will wait for the animation to complete */
  immediateFocus?: boolean
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
}

export const PasswordForm: FC<PasswordFormProps> = ({
  error,
  verifyPassword,
  immediateFocus,
  children,
  ...rest
}) => {
  const { control, formState, handleSubmit, clearErrors, setError } =
    useForm<FieldValues>({ defaultValues: { password: "" } })
  const { errors, isDirty, isSubmitting } = formState

  const isCapsLockOn = useCapsLockStatus()

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

  const inputRef = useAutoFocusInputRef<HTMLInputElement>(!immediateFocus)

  const InfoMessage = ({
    text,
    isError,
  }: {
    text?: string
    isError?: boolean
  }) => {
    const textColor = isError ? "error.500" : "text-primary"
    return (
      <Box
        position="relative"
        display="flex"
        justifyContent="flex-start"
        gap="5px"
        mt="3"
      >
        <Text fontSize="sm" color={textColor}>
          <InfoCircleSecondaryIcon />
        </Text>
        <FieldError color={textColor}>{text}</FieldError>
      </Box>
    )
  }

  return (
    <Flex
      as="form"
      direction="column"
      /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
      onSubmit={handleSubmit(handlePassword)}
      {...rest}
    >
      <Controller
        name="password"
        control={control}
        /** Note: do not add any extra validation here - should be handled only by `verifyPassword` */
        rules={{ required: true }}
        defaultValue=""
        render={({ field: { ref, ...field } }) => (
          <InputGroup>
            {isCapsLockOn && (
              <InputRightElement pointerEvents="none" mr={"6px"}>
                <BackupPrimaryIcon
                  color="icon-secondary"
                  height={"20px"}
                  width={"20px"}
                />
              </InputRightElement>
            )}
            <Input
              placeholder="Password"
              type="password"
              autoFocus={immediateFocus}
              {...field}
              isInvalid={!isEmpty(errors.password)}
              ref={(e) => {
                ref(e)
                inputRef.current = e
              }}
            />
          </InputGroup>
        )}
      />
      {!isEmpty(errors.password) && (
        <InfoMessage
          isError={true}
          text={
            errors.password?.type === "required"
              ? "Password is required"
              : errors.password.message
          }
        ></InfoMessage>
      )}
      {isCapsLockOn && (
        <InfoMessage isError={false} text={"Caps lock is on"}></InfoMessage>
      )}
      {children?.({ isDirty, isSubmitting })}
    </Flex>
  )
}
