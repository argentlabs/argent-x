import { FC } from "react"
import styled from "styled-components"

const StickyArgentFooterP = styled.p`
  position: absolute;
  bottom: 24px;
  left: 0;
  width: 100%;

  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
  color: #fff;
`

export const StickyArgentFooter: FC = () => {
  // eslint-disable-next-line jsx-a11y/accessible-emoji
  return <StickyArgentFooterP>Built with ❤️ by Argent</StickyArgentFooterP>
}
