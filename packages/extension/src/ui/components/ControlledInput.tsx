import { FieldError } from "@argent/ui"
import { Input, InputProps } from "@chakra-ui/react"
import { FC } from "react"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"

import { useAutoFocusInputRef } from "../hooks/useAutoFocusInputRef"

interface ControlledInputProps<TFieldValues extends FieldValues = any>
  extends InputProps {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
}

export const ControlledInput: FC<ControlledInputProps> = ({
  control,
  name,
  autoFocus,
  children,
  ...rest
}) => {
  const inputRef = useAutoFocusInputRef<HTMLInputElement>(Boolean(autoFocus))
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <>
          <Input
            {...rest}
            ref={(e) => {
              ref(e)
              inputRef.current = e
            }}
            onChange={onChange}
            name={name}
            value={value}
            isInvalid={Boolean(error)}
          />
          {error && <FieldError>{error.message}</FieldError>}
        </>
      )}
    />
  )
}
