import styled from "styled-components"

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
  border-radius: 12px;
  padding: 5px;
  margin-left: 5px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`

export const AccountAddressLink = styled.a`
  font-size: 12px;
  line-height: 14px;
  max-width: 170px;
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

  & > svg {
    margin-left: 7px;
  }
`
