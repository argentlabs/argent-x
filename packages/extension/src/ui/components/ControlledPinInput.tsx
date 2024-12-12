import type { PinInputProps } from "@chakra-ui/react"
import { PinInput } from "@chakra-ui/react"
import type { FC } from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

interface ControlledPinInputProps<TFieldValues extends FieldValues = any>
  extends PinInputProps {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
}

export const ControlledPinInput: FC<ControlledPinInputProps> = ({
  control,
  name,
  children,
  ...props
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <PinInput {...props} onChange={onChange} value={value}>
          {children}
        </PinInput>
      )}
    />
  )
}
