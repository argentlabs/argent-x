import { FC } from "react"
import { IconButton } from "./IconButton"
import BackSvg from "../../assets/back.svg"
import { makeClickable } from "../utils/a11y"

export const BackButton: FC<{ onClick?: () => void }> = ({
  onClick,
  ...props
}) => {
  return (
    <IconButton {...makeClickable(onClick, 99)} size={32} {...props}>
      <BackSvg />
    </IconButton>
  )
}
