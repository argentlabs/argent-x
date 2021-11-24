import styled from "styled-components"

import { H1 } from "../Typography"

export const AccountAddressWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const AccountAddressIconsWrapper = styled.span`
  display: flex;
  gap: 6px;
  align-items: center;
  border: rgba(255, 255, 255, 0.15) solid 1px;
  border-radius: 10px;
  padding: 4px 4px;
  margin-left: 5px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`

export const AccountAddressLink = styled.a`
  font-size: 10px;
  line-height: 12px;
  max-width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
  border: rgba(255, 255, 255, 0.15) solid 1px;
  border-radius: 10px;
  padding: 4px 10px;
  white-space: nowrap;
  color: white;
  text-decoration: none;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`
