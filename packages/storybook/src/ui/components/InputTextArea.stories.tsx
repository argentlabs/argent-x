/* eslint-disable react/prop-types */
import { Button } from "@argent-x/extension/src/ui/components/Button"
import Column from "@argent-x/extension/src/ui/components/Column"
import { StyledControlledTextArea } from "@argent-x/extension/src/ui/components/InputText"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { useCallback } from "react"
import { useForm } from "react-hook-form"

export default {
  title: "components/InputTextArea",
  component: StyledControlledTextArea,
} as ComponentMeta<typeof StyledControlledTextArea>

const Template: ComponentStory<typeof StyledControlledTextArea> = (props) => {
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
        <StyledControlledTextArea
          control={control}
          {...props}
          name="test"
          placeholder="Placeholder"
        ></StyledControlledTextArea>
        <Button type="submit">Submit</Button>
        {props.onlyNumeric && <Button onClick={onMaxClicked}>MAX</Button>}
      </Column>
    </form>
  )
}

export const Default = Template.bind({})
Default.args = {}

export const OnlyNumeric = Template.bind({})
OnlyNumeric.args = {
  onlyNumeric: true,
  maxRows: 3,
}

export const OnlyAddressHex = Template.bind({})
OnlyAddressHex.args = {
  onlyAddressHex: true,
  minRows: 3,
  maxRows: 3,
}
