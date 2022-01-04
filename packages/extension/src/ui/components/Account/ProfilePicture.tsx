import styled, { css } from "styled-components"

export const ProfilePicture = styled.img<{
  disabled?: boolean
}>`
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 50%;
  border: 2px solid transparent;

  ${({ disabled }) =>
    !disabled &&
    css`
      cursor: pointer;

      &:hover,
      &:focus {
        border: 2px solid transparent;
        outline: 2px solid white;
      }
    `}
`
