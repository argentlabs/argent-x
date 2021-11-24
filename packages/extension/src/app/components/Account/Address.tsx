import styled from "styled-components"

import { H1, P } from "../Typography"

export const AccountName = styled(H1)`
  font-weight: 600;
  font-size: 24px;
  line-height: 22px;
  margin: 0;
`

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
`

export const AccountAddress = styled(P)`
  font-size: 10px;
  line-height: 12px;
  max-width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
  border: rgba(255, 255, 255, 0.15) solid 1px;
  border-radius: 10px;
  padding: 4px 10px;
  white-space: nowrap;
`
