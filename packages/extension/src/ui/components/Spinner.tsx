import { CircularProgress, CircularProgressProps } from "@mui/material"
import { isNumber } from "lodash-es"
import { FC } from "react"
import { useTheme } from "styled-components"

const defaultStyle = {
  margin: "0 auto",
}

export const Spinner: FC<CircularProgressProps> = (props) => {
  const theme = useTheme()

  if (isNumber(props.value)) {
    const value = 4 * Math.round(props.value * 25)
    props = { ...props, value, variant: "determinate" }
  }

  return (
    <CircularProgress
      data-testid="spinner"
      {...props}
      style={{ ...defaultStyle, color: theme.text1, ...props.style }}
    />
  )
}
