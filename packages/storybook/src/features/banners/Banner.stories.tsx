import { Meta, StoryObj } from "@storybook/react"
import { icons } from "@argent/x-ui"

import { Banner } from "@argent-x/extension/src/ui/features/banners/Banner"
import { decorators } from "../../decorators/routerDecorators"

const { WarningCircleSecondaryIcon } = icons

const meta: Meta<typeof Banner> = {
  component: Banner,
  decorators,
}

export default meta

type Story = StoryObj<typeof Banner>

export const Default: Story = {
  args: {
    title: "Account deprecated",
    description: "Click to learn more",
    icon: <WarningCircleSecondaryIcon />,
    onClick: () => {
      console.log("onClick")
    },
    onClose: undefined,
  },
}

export const WithLinkTitle: Story = {
  args: {
    title: "Account deprecated",
    linkTitle: "Click to learn more",
    icon: <WarningCircleSecondaryIcon />,
    onClose: undefined,
  },
}

export const WithLinkTitleAndUrl: Story = {
  args: {
    ...WithLinkTitle.args,
    linkUrl: "https://argent.xyz",
  },
}

export const WithoutIcon: Story = {
  args: {
    ...Default.args,
    title: "Account deprecated",
    description: "Click to learn more",
    icon: undefined,
  },
}

export const WithClose: Story = {
  args: {
    ...Default.args,
    onClose: () => {
      console.log("onClose")
    },
  },
}

export const LongText: Story = {
  args: {
    ...Default.args,
    title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. ",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
  },
}

export const LongTextWithLinkTitleAndClose: Story = {
  args: {
    ...LongText.args,
    linkTitle: "Learn more",
    onClose: () => {
      console.log("onClose")
    },
  },
}
