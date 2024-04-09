import { FieldError } from "@argent/x-ui"
import { Textarea, TextareaProps } from "@chakra-ui/react"
import { FC } from "react"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"

interface ControlledInputProps<TFieldValues extends FieldValues = any>
  extends TextareaProps {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
}

export const ControlledTextArea: FC<ControlledInputProps> = ({
  control,
  name,
  ...props
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <Textarea
            {...props}
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
