import { FC, ReactNode, useEffect, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"

import { InputText } from "../../components/InputText"
import { FormError } from "../../components/Typography"
import { validatePassword } from "../recovery/seedRecovery.state"

interface FieldValues {
  password: string
}

interface PasswordFormProps {
  verifyPassword: (password: string) => Promise<boolean>
  children?: (isDirty: boolean) => ReactNode
}

export const PasswordForm: FC<PasswordFormProps> = ({
  verifyPassword,
  children,
}) => {
  const [passwordError, setPasswordError] = useState<string>()
  const { control, formState, handleSubmit, setError } = useForm<FieldValues>()
  const { errors, isDirty } = formState

  useEffect(() => {
    setError("password", { message: passwordError })
  }, [passwordError])

  const handlePassword: SubmitHandler<FieldValues> = async ({ password }) => {
    setPasswordError(undefined)
    if (!(await verifyPassword(password))) {
      setPasswordError("Wrong password")
    }
  }

  return (
    <form onSubmit={handleSubmit(handlePassword)}>
      <Controller
        name="password"
        control={control}
        rules={{ required: true, validate: validatePassword }}
        defaultValue=""
        render={({ field: { ref, ...field } }) => (
          <InputText
            autoFocus
            placeholder="Password"
            type="password"
            {...field}
          />
        )}
      />
      {errors.password?.type === "validate" && (
        <FormError>Password is too short</FormError>
      )}
      {errors.password?.type === "required" && (
        <FormError>Password is required</FormError>
      )}
      {errors.password?.message && (
        <FormError>{errors.password.message}</FormError>
      )}
      {children?.(isDirty)}
    </form>
  )
}
