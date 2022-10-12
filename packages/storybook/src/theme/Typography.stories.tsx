import {
  B1,
  B2,
  B3,
  FieldError,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  L1,
  L2,
  P1,
  P2,
  P3,
  P4,
} from "@argent-x/ui/src/components/Typography"
import { UtilitiesProps, utilities } from "@argent-x/ui/src/theme/utilities"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { FC } from "react"
import styled from "styled-components"

const Box = styled.div<UtilitiesProps>`
  ${utilities}
  display:flex;
  flex-direction: column;
`

const TypographyStory: FC = () => {
  return (
    <Box gap={3}>
      <H1>H1 - Heading 1</H1>
      <H2>H2 - Heading 2</H2>
      <H3>H3 - Heading 3</H3>
      <H4>H4 - Heading 4</H4>
      <H5>H5 - Heading 5</H5>
      <H6>H6 - Heading 6</H6>
      <P1>P1 - Paragraph 1</P1>
      <P2>P2 - Paragraph 2</P2>
      <P3>P3 - Paragraph 3</P3>
      <P4>P4 - Paragraph 4</P4>
      <B1>B1 - Button 1</B1>
      <B2>B2 - Button 2</B2>
      <B3>B3 - Button 3</B3>
      <L1>L1 - Label 1</L1>
      <L2>L2 - Label 2</L2>
      <FieldError>FieldError - Field error</FieldError>
    </Box>
  )
}

export default {
  title: "theme/Typography",
  component: TypographyStory,
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
  },
} as ComponentMeta<typeof TypographyStory>

const Template: ComponentStory<typeof TypographyStory> = (props) => (
  <TypographyStory {...props}></TypographyStory>
)

export const Default = Template.bind({})
Default.args = {}
