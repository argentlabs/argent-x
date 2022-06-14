import styled, { css } from "styled-components"

export interface ProfilePictureProps {
  disabled?: boolean
  small?: boolean
}

const sizeAttribute = ({ small }: ProfilePictureProps) =>
  small ? "24px" : "36px"

export const ProfilePicture = styled.img<ProfilePictureProps>`
  width: ${sizeAttribute};
  height: ${sizeAttribute};
  flex: 0 0 ${sizeAttribute};
  border-radius: 50%;
  border: ${({ small }) => (small ? "none" : "2px solid transparent")};

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
