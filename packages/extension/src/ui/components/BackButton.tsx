import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { makeClickable } from "../utils/a11y"
import { IconButton } from "./IconButton"
import { ArrowBackIosNewIcon } from "./Icons/MuiIcons"

interface BackButtonProps {
  to?: string
}

export const BackButton: FC<BackButtonProps> = (props) => {
  const navigate = useNavigate()
  const onClick = () => (props.to ? navigate(props.to) : navigate(-1))

  return (
    <IconButton {...makeClickable(onClick, 99)} size={36} {...props}>
      <ArrowBackIosNewIcon />
    </IconButton>
  )
}
