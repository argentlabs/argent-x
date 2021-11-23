import { FC } from "react"

import BackSvg from "../../assets/back.svg"
import { makeClickable } from "../utils/a11y"
import { IconButton } from "./IconButton"

export const BackButton: FC<{ onClick?: () => void }> = ({
  onClick,
  ...props
}) => {
  return (
    <IconButton {...makeClickable(onClick, 99)} size={32} {...props}
      style={{
        transform: "translateX(-8px)",
      }}
    >
      <BackSvg />
    </IconButton>
  )
}
