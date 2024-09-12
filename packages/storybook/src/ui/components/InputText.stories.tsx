/* eslint-disable react/prop-types */
import Column from "@argent-x/extension/src/ui/components/Column"
import { StyledControlledInput } from "@argent-x/extension/src/ui/components/InputText"
import { Button } from "@chakra-ui/react"
import { ComponentProps, FC, useCallback } from "react"
import { useForm } from "react-hook-form"

export default {
  component: StyledControlledInput,
}

const Template: FC<ComponentProps<typeof StyledControlledInput>> = (props) => {
  const { control, handleSubmit, setValue } = useForm()

  const onMaxClicked = useCallback(() => {
    if (props.onlyNumeric) {
      setValue("test", "0.12345678901234567890")
    }
  }, [props.onlyNumeric])

  const onSubmit = (data: any) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Column gap="8px">
        <StyledControlledInput
          control={control}
          {...props}
          name="test"
          placeholder="Placeholder"
        ></StyledControlledInput>
        <Button type="submit">Submit</Button>
        {props.onlyNumeric && <Button onClick={onMaxClicked}>MAX</Button>}
      </Column>
    </form>
  )
}

export const Default = {
  render: Template,
  args: {
    variant: "neutrals",
  },
}

export const OnlyNumeric = {
  ...Default,
  args: {
    onlyNumeric: true,
  },
}

export const OnlyAddressHex = {
  ...Default,
  args: {
    onlyAddressHex: true,
  },
}

export const Password = {
  ...Default,
  args: {
    variant: "neutrals",
    type: "password",
  },
}
