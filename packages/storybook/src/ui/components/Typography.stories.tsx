import { Typography } from "@argent-x/ui/src/components/Typography"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Typography",
  component: Typography,
  argTypes: {
    variant: {
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p1",
        "p2",
        "p3",
        "p4",
        "b1",
        "b2",
        "b3",
        "l1",
        "l2",
      ],
      control: { type: "inline-radio" },
    },
  },
} as ComponentMeta<typeof Typography>

const Template: ComponentStory<typeof Typography> = (props) => (
  <>
    <Typography {...props}></Typography>
  </>
)

export const H1 = Template.bind({})
H1.args = {
  children: "Typography H1",
  variant: "h1",
}

export const H2 = Template.bind({})
H2.args = {
  children: "Typography H2",
  variant: "h2",
}

export const H3 = Template.bind({})
H3.args = {
  children: "Typography H3",
  variant: "h3",
}

export const H4 = Template.bind({})
H4.args = {
  children: "Typography H4",
  variant: "h4",
}

export const H5 = Template.bind({})
H5.args = {
  children: "Typography H5",
  variant: "h5",
}

export const H6 = Template.bind({})
H6.args = {
  children: "Typography H6",
  variant: "h6",
}

export const P1 = Template.bind({})
P1.args = {
  children: "Typography P1",
  variant: "p1",
}

export const P2 = Template.bind({})
P2.args = {
  children: "Typography P2",
  variant: "p2",
}

export const P3 = Template.bind({})
P3.args = {
  children: "Typography P3",
  variant: "p3",
}

export const P4 = Template.bind({})
P4.args = {
  children: "Typography P4",
  variant: "p4",
}

export const B1 = Template.bind({})
B1.args = {
  children: "Typography B1",
  variant: "b1",
}

export const B2 = Template.bind({})
B2.args = {
  children: "Typography B2",
  variant: "b2",
}

export const B3 = Template.bind({})
B3.args = {
  children: "Typography B3",
  variant: "b3",
}

export const L1 = Template.bind({})
L1.args = {
  children: "Typography L1",
  variant: "l1",
}

export const L2 = Template.bind({})
L2.args = {
  children: "Typography L2",
  variant: "l2",
}
