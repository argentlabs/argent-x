/* eslint-disable react/prop-types */
import { Button } from "@argent-x/extension/src/ui/components/Button"
import Column from "@argent-x/extension/src/ui/components/Column"
import { StyledControlledInput } from "@argent-x/extension/src/ui/components/InputText"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { useCallback } from "react"
import { useForm } from "react-hook-form"

export default {
  title: "components/InputText",
  component: StyledControlledInput,
} as ComponentMeta<typeof StyledControlledInput>

const Template: ComponentStory<typeof StyledControlledInput> = (props) => {
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

export const Default = Template.bind({})
Default.args = {
  variant: "neutrals",
}

export const OnlyNumeric = Template.bind({})
OnlyNumeric.args = {
  onlyNumeric: true,
}

export const OnlyAddressHex = Template.bind({})
OnlyAddressHex.args = {
  onlyAddressHex: true,
}

export const Password = Template.bind({})
Password.args = {
  variant: "neutrals",
  type: "password",
}
