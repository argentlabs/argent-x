import { FC, ReactNode, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { InputText } from "../../components/InputText"
import { FormError } from "../../components/Typography"
import { startSession } from "../../services/messaging"
import { recover } from "../recovery/recovery.service"
import { validatePassword } from "../recovery/seedRecovery.state"

interface PasswordFormProps {
  onSubmit?: () => void
  onSuccess?: (target: string) => void
  onFailure?: () => void
  children?: (isDirty: boolean) => ReactNode
}

export const PasswordForm: FC<PasswordFormProps> = ({
  onSubmit,
  onSuccess,
  onFailure,
  children,
}) => {
  const [passwordError, setPasswordError] = useState<string>()
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    setError,
  } = useForm<{ password: string }>()
  useEffect(() => {
    setError("password", { message: passwordError })
  }, [passwordError])

  const verifyPassword = async (password: string) => {
    onSubmit?.()
    setPasswordError(undefined)
    try {
      await startSession(password)

      const target = await recover()
      console.warn("target", target)
      setPasswordError(undefined)
      onSuccess?.(target)
    } catch {
      setPasswordError("Wrong password")
      onFailure?.()
    }
  }

  return (
    <form onSubmit={handleSubmit(({ password }) => verifyPassword(password))}>
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
