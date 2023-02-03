import {
  ButtonCell,
  CellStack,
  HeaderCell,
  P4,
  SpacerCell,
  Switch,
} from "@argent/ui"
import { icons } from "@argent/ui"
import { ComponentMeta, ComponentStory } from "@storybook/react"

const { ArgentShieldIcon } = icons

export default {
  title: "components/CellStack",
  component: CellStack,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
  args: {
    isChecked: true,
  },
  argTypes: {
    isChecked: {
      control: {
        type: "boolean",
      },
    },
  },
} as ComponentMeta<typeof CellStack>

const Template: ComponentStory<typeof CellStack> = (props, { args }) => (
  <CellStack {...props}>
    <HeaderCell>HeaderCell</HeaderCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <HeaderCell>HeaderCell</HeaderCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <ButtonCell color={"error.500"}>ButtonCell with color</ButtonCell>

    <SpacerCell />

    <ButtonCell
      leftIcon={<ArgentShieldIcon fontSize={"xl"} />}
      rightIcon={<Switch size={"lg"} isChecked={args.isChecked} />}
    >
      <>Argent Shield</>
      <P4 color="neutrals.300" fontWeight={"normal"}>
        Two-factor account protection
      </P4>
    </ButtonCell>

    <SpacerCell />

    <ButtonCell
      rightIcon={<Switch isChecked={args.isChecked} />}
      extendedDescription={
        <P4 color="neutrals.300" w="100%">
          Add extra protection to your Argent X accounts with two-factor
          security. You need to have been added to the whitelist to use this
          feature while it’s in beta
        </P4>
      }
    >
      Change account implementation
    </ButtonCell>

    <ButtonCell rightIcon={<Switch isChecked={args.isChecked} />}>
      Argent Shield (2FA)
    </ButtonCell>
  </CellStack>
)

export const Default = Template.bind({})
Default.args = {}
