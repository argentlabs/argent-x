import { FC } from "react"
import styled from "styled-components"

const StickyArgentFooterP = styled.p`
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;

  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
  color: #fff;

  ${(props) => props.theme.breakpoints.up("sm")} {
    left: ${(props) => props.theme.margin.extensionInTab};
    right: ${(props) => props.theme.margin.extensionInTab};
  }
`

const EmojiWrapper = styled.span`
  margin-right: 0.5em;
`

export const StickyArgentFooter: FC = () => (
  <StickyArgentFooterP>
    Built with <EmojiWrapper aria-label="heart">❤️</EmojiWrapper>
    by Argent
  </StickyArgentFooterP>
)
