import { isString } from "lodash-es"
import { FC, ReactNode, useEffect } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"

import { useAppState } from "../../app.state"
import { InputText } from "../../components/InputText"
import { FormError } from "../../theme/Typography"
import { validatePassword } from "../recovery/seedRecovery.state"

interface FieldValues {
  password: string
}

interface PasswordFormProps {
  verifyPassword: (password: string) => Promise<boolean>
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
}

export const PasswordForm: FC<PasswordFormProps> = ({
  verifyPassword,
  children,
}) => {
  const { control, formState, handleSubmit, clearErrors, setError } =
    useForm<FieldValues>()
  const { errors, isDirty, isSubmitting } = formState

  const { error } = useAppState() // FIXME: as a hack we need to use global storage here, as the password form unmounts for the loading screen
  useEffect(() => {
    if (isString(error)) {
      setError("password", { message: error })
      useAppState.setState({ error: undefined }) // reset error string once we picked it up
    }
  }, [error, setError])

  const handlePassword: SubmitHandler<FieldValues> = async ({ password }) => {
    clearErrors("password")
    await verifyPassword(password)
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
      {children?.({ isDirty, isSubmitting })}
    </form>
  )
}
