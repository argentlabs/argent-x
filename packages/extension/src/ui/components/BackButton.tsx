import { FC } from "react"
import { useNavigate } from "react-router-dom"

import BackSvg from "../../assets/back.svg"
import { makeClickable } from "../utils/a11y"
import { IconButton } from "./IconButton"

export const BackButton: FC = (props) => {
  const navigate = useNavigate()
  const onClick = () => navigate(-1)

  return (
    <IconButton {...makeClickable(onClick, 99)} size={36} {...props}>
      <BackSvg />
    </IconButton>
  )
}
