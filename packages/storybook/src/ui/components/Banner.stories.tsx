import { Banner } from "@argent-x/extension/src/ui/components/Banner"
import { UpdateIcon } from "@argent-x/extension/src/ui/components/Icons/UpdateIcon"
import { WarningIcon } from "@argent-x/extension/src/ui/components/Icons/WarningIcon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Banner",
  component: Banner,
  argTypes: {
    theme: {
      control: {
        type: "radio",
        options: {
          default: undefined,
          danger: "danger",
        },
      },
    },
  },
} as ComponentMeta<typeof Banner>

const Template: ComponentStory<typeof Banner> = (props) => (
  <Banner {...props}></Banner>
)

export const Migrate = Template.bind({})
Migrate.args = {
  title: "Please migrate your funds",
  description: "This account will be deprecated soon",
  theme: "danger",
  icon: <WarningIcon style={{ transform: "scale(1.5)" }} />,
}

export const Upgrade = Template.bind({})
Upgrade.args = {
  title: "Upgrade Available",
  description: "You need ETH to cover transaction fees!",
  icon: <UpdateIcon />,
}
