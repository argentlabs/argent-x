import { FC } from "react"
import styled from "styled-components"

const StickyArgentFooterP = styled.p`
  position: fixed;
  bottom: 24px;
  left: 0;
  width: 100%;

  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
  color: #fff;
`

const EmojiWrapper = styled.span`
  margin-right: 0.5em;
`

export const StickyArgentFooter: FC = () => {
  return (
    <StickyArgentFooterP>
      Built with <EmojiWrapper aria-label="heart">❤️</EmojiWrapper>
      by Argent
    </StickyArgentFooterP>
  )
}
