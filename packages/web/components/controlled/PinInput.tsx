import { PinInput } from "@argent/ui"
import { PinInputProps } from "@chakra-ui/react"
import { FC } from "react"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"

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
      render={({
        field: { onChange, value },
        fieldState: { invalid, error },
      }) => (
        <PinInput {...props} onChange={onChange} value={value}>
          {children}
        </PinInput>
      )}
    />
  )
}
