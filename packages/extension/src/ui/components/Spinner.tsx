import { CircularProgress, CircularProgressProps } from "@mui/material"
import { isNumber } from "lodash-es"
import { FC } from "react"

const defaultStyle = { color: "white", margin: "0 auto" }

export const Spinner: FC<CircularProgressProps> = (props) => {
  if (isNumber(props.value)) {
    const value = 4 * Math.round(props.value * 25)
    props = { ...props, value, variant: "determinate" }
  }

  return (
    <CircularProgress {...props} style={{ ...defaultStyle, ...props.style }} />
  )
}
