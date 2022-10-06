import styled, { css } from "styled-components"

export interface ProfilePictureProps {
  disabled?: boolean
  size?: "lg" | "md" | "sm" | "xxl"
}

const sizeAttribute = ({ size = "md" }: ProfilePictureProps) =>
  (size === "sm" && "24px") ||
  (size === "md" && "36px") ||
  (size === "lg" && "40px") ||
  (size === "xxl" && "164px")

export const ProfilePicture = styled.img<ProfilePictureProps>`
  width: ${sizeAttribute};
  height: ${sizeAttribute};
  flex: 0 0 ${sizeAttribute};
  border-radius: 50%;
  border: ${({ size }) => (size === "sm" ? "none" : "2px solid transparent")};

  ${({ disabled }) =>
    !disabled &&
    css`
      cursor: pointer;

      &:hover,
      &:focus {
        border: 2px solid transparent;
        outline: 2px solid ${({ theme }) => theme.text1};
      }
    `}
`
