import { FC } from "react"
import styled from "styled-components"

import { ResponsiveFixedBox } from "../../components/Responsive"

const Container = styled(ResponsiveFixedBox)`
  bottom: 50px;
  left: 0;
  right: 0;

  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
  color: #fff;
`

const EmojiWrapper = styled.span`
  margin-right: 0.5em;
`

export const StickyArgentFooter: FC = () => (
  <Container as="p">
    Built with <EmojiWrapper aria-label="heart">❤️</EmojiWrapper>
    by Argent
  </Container>
)
