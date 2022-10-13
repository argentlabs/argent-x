import { FC } from "react"
import styled from "styled-components"

import { ArrowForwardIosIcon } from "./Icons/MuiIcons"

interface IDisclosureIcon {
  expanded: boolean
}

const DisclosureIconContainer = styled.div<IDisclosureIcon>`
  transition: transform 0.2s;
  transform: rotate(${({ expanded }) => (expanded ? "270deg" : "90deg")});
  line-height: 1;
  width: 1em;
  height: 1em;
`

export const DisclosureIcon: FC<IDisclosureIcon> = ({ expanded }) => (
  <DisclosureIconContainer expanded={expanded}>
    <ArrowForwardIosIcon fontSize="inherit" />
  </DisclosureIconContainer>
)
