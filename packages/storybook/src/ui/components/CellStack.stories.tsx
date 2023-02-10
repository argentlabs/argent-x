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

const { ArgentShieldIcon, TickIcon, MulticallIcon, WalletIcon, PluginIcon } =
  icons

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
      leftIcon={<MulticallIcon />}
      rightIcon={<TickIcon color="primary.500" />}
      extendedDescription={
        "The Argent account implementation with better multicall support"
      }
    >
      Better Multicall
    </ButtonCell>
    <ButtonCell
      leftIcon={<WalletIcon />}
      rightIcon={<P4 color="primary.500">Enable</P4>}
      extendedDescription={"The default Argent account implementation"}
    >
      Default
    </ButtonCell>
    <ButtonCell
      leftIcon={<PluginIcon />}
      rightIcon={<P4 color="primary.500">Enable</P4>}
      extendedDescription={
        "The Argent account implementation with plugin support"
      }
    >
      Plugin
    </ButtonCell>

    <SpacerCell />

    <ButtonCell
      rightIcon={<Switch isChecked={args.isChecked} />}
      extendedDescription={
        "Shows a new menu item in the account settings, which allows a user to switch account implementation for an account."
      }
    >
      Change account implementation
    </ButtonCell>

    <ButtonCell
      rightIcon={<Switch isChecked={args.isChecked} />}
      extendedDescription={
        "Add extra protection to your Argent X accounts with two-factor security. You need to have been added to the whitelist to use this feature while it is in beta"
      }
    >
      Argent Shield (2FA)
    </ButtonCell>
  </CellStack>
)

export const Default = Template.bind({})
Default.args = {}
