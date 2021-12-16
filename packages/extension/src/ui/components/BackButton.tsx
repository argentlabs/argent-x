import { FC } from "react"

import BackSvg from "../../assets/back.svg"
import { makeClickable } from "../utils/a11y"
import { IconButton } from "./IconButton"

interface BackButtonProps {
  onClick?: () => void
}

export const BackButton: FC<BackButtonProps> = ({ onClick, ...props }) => (
  <IconButton {...makeClickable(onClick, 99)} size={36} {...props}>
    <BackSvg />
  </IconButton>
)
