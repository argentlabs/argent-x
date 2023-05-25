import { FieldError } from "@argent/ui"
import { Input, InputProps } from "@chakra-ui/react"
import { FC } from "react"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"

interface ControlledInputProps<TFieldValues extends FieldValues = any>
  extends InputProps {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
}

export const ControlledInput: FC<ControlledInputProps> = ({
  control,
  name,
  children,
  ...props
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <Input
            {...props}
            onChange={onChange}
            name={name}
            value={value}
            isInvalid={Boolean(error)}
          >
            {children}
          </Input>
          {error && <FieldError>{error.message}</FieldError>}
        </>
      )}
    />
  )
}
